package com.hostel.service;

import com.hostel.dto.StudentResponse;
import com.hostel.entity.Student;
import org.springframework.data.domain.Page;

import java.util.List;

public interface StudentService {

    StudentResponse saveStudent(Student student);

    List<StudentResponse> getAllStudents();

//    Page<StudentResponse> getAllStudents(
//            int page,
//            int size,
//            String sortBy,
//            String direction
//    );

    StudentResponse getStudentById(Long id);
    StudentResponse getMyStudent(String username);

    Student updateStudent(Long id, Student studentDetails);

    void deleteStudent(Long id);

    Student assignRoom(Long studentId, String roomNumber);

    StudentResponse changeRoom(Long studentId, String newRoomNumber);

//    Page<StudentResponse> getAllStudents(int page, int size);

    Page<StudentResponse> getAllStudents(
            int page,
            int size,
            String sortBy,
            String direction
    );
    Page<StudentResponse> searchStudentsByName(
            String name,
            int page,
            int size
    );
}
