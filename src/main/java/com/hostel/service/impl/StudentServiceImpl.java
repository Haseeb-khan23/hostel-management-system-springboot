package com.hostel.service.impl;

import com.hostel.dto.StudentResponse;
import com.hostel.entity.Student;
import com.hostel.exception.BusinessException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.StudentRepository;
import com.hostel.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.hostel.entity.Room;
import com.hostel.repository.RoomRepository;


import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;

    public StudentServiceImpl(
            StudentRepository studentRepository,
            RoomRepository roomRepository) {

        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public StudentResponse saveStudent(Student student) {
        Student savedStudent = studentRepository.save(student);
        return toStudentResponse(savedStudent);
    }

    @Override
    public List<StudentResponse> getAllStudents() {

        return studentRepository.findAll()
                .stream()
                .map(this::toStudentResponse)
                .toList();
    }

    @Override
    public StudentResponse getStudentById(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id));

        return toStudentResponse(student);
    }

    @Override
    public Student updateStudent(Long id, Student studentDetails) {

        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id));

        existingStudent.setName(studentDetails.getName());
        existingStudent.setMobileNo(studentDetails.getMobileNo());
        existingStudent.setCourse(studentDetails.getCourse());
        existingStudent.setAddress(studentDetails.getAddress());
        existingStudent.setPaymentStatus(studentDetails.getPaymentStatus());

        return studentRepository.save(existingStudent);
    }

    @Transactional
    @Override
    public void deleteStudent(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id));

        Room room = student.getRoom();

        if (room != null) {
            room.setCurrentOccupants(
                    room.getCurrentOccupants() - 1
            );

            roomRepository.save(room);
        }

        studentRepository.delete(student);
    }

    @Transactional
    @Override
    public Student assignRoom(Long studentId, String roomNumber) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId));

        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found: " + roomNumber));

        if (student.getRoom() != null) {
            throw new BusinessException(
                    "Student is already assigned to a room");
        }

        if (room.getCurrentOccupants() >= room.getCapacity()) {
            throw new BusinessException(
                    "Room is already full");
        }

        student.setRoom(room);

        room.setCurrentOccupants(room.getCurrentOccupants() + 1);

        roomRepository.save(room);

        return studentRepository.save(student);
    }
    @Transactional
    @Override
    public StudentResponse changeRoom(Long studentId, String newRoomNumber) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId));

        Room newRoom = roomRepository.findByRoomNumber(newRoomNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found: " + newRoomNumber));

        if (student.getRoom() != null &&
                student.getRoom().getRoomNumber().equals(newRoomNumber)) {

            throw new BusinessException(
                    "Student is already assigned to this room");
        }

        if (newRoom.getCurrentOccupants() >= newRoom.getCapacity()) {
            throw new BusinessException(
                    "New room is already full");
        }

        Room oldRoom = student.getRoom();

        if (oldRoom != null) {
            oldRoom.setCurrentOccupants(
                    oldRoom.getCurrentOccupants() - 1
            );

            roomRepository.save(oldRoom);
        }

        newRoom.setCurrentOccupants(
                newRoom.getCurrentOccupants() + 1
        );

        student.setRoom(newRoom);

        roomRepository.save(newRoom);

        Student savedStudent = studentRepository.save(student);

        return toStudentResponse(savedStudent);
    }

    private StudentResponse toStudentResponse(Student student) {

        String roomNumber = null;

        if (student.getRoom() != null) {
            roomNumber = student.getRoom().getRoomNumber();
        }

        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getMobileNo(),
                student.getCourse(),
                student.getAddress(),
                student.getPaymentStatus(),
                roomNumber
        );
    }
//
//    @Override
//    public Page<StudentResponse> getAllStudents(int page, int size){
//        Pageable pageable = PageRequest.of(page, size);
//
//        return studentRepository.findAll(pageable).map(this::toStudentResponse);
//    }

    @Override
    public Page<StudentResponse> getAllStudents(
            int page,
            int size,
            String sortBy,
            String direction) {

        Sort sort;

        if (direction.equalsIgnoreCase("desc")) {
            sort = Sort.by(sortBy).descending();
        } else {
            sort = Sort.by(sortBy).ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        return studentRepository.findAll(pageable)
                .map(this::toStudentResponse);
    }

    @Override
    public Page<StudentResponse> searchStudentsByName(
            String name,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);

        return studentRepository
                .findByNameContainingIgnoreCase(name, pageable)
                .map(this::toStudentResponse);
    }
}