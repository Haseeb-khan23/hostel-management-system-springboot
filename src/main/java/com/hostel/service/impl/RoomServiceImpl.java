package com.hostel.service.impl;

import com.hostel.entity.Room;
import com.hostel.entity.Student;
import com.hostel.exception.BusinessException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import com.hostel.service.RoomService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;

    public RoomServiceImpl(
            RoomRepository roomRepository,
            StudentRepository studentRepository) {

        this.roomRepository = roomRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public Room saveRoom(Room room) {

        if (roomRepository.findByRoomNumber(room.getRoomNumber()).isPresent()) {
            throw new BusinessException(
                    "Room already exists with number: " + room.getRoomNumber()
            );
        }

        room.setCurrentOccupants(0);

        return roomRepository.save(room);
    }

    @Override
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Room not found with id: " + id));
    }
    @Override
    public Room updateRoom(Long id, Room roomDetails) {

        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + id));

        // Check duplicate room number
        if (!existingRoom.getRoomNumber().equals(roomDetails.getRoomNumber())
                && roomRepository.findByRoomNumber(roomDetails.getRoomNumber()).isPresent()) {

            throw new BusinessException(
                    "Room already exists with number: "
                            + roomDetails.getRoomNumber());
        }

        existingRoom.setRoomNumber(roomDetails.getRoomNumber());
        existingRoom.setRoomType(roomDetails.getRoomType());

        // Capacity cannot be less than current occupants
        if (roomDetails.getCapacity() < existingRoom.getCurrentOccupants()) {
            throw new BusinessException(
                    "Capacity cannot be less than current occupants");
        }

        existingRoom.setCapacity(roomDetails.getCapacity());
        existingRoom.setPrice(roomDetails.getPrice());

        return roomRepository.save(existingRoom);
    }

    @Override
    public void deleteRoom(Long id) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + id));

        List<Student> students =
                studentRepository.findByRoom_RoomNumber(
                        room.getRoomNumber());

        if (!students.isEmpty()) {
            throw new BusinessException(
                    "Cannot delete room. Students are currently assigned to it");
        }

        roomRepository.delete(room);
    }
}