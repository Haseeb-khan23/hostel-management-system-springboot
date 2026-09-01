package com.hostel.controller;

import com.hostel.dto.StudentResponse;
import com.hostel.entity.Student;
import com.hostel.service.StudentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<StudentResponse> getAllStudents() {
        return studentService.getAllStudents();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponse createStudent(@Valid @RequestBody Student student) {
        return studentService.saveStudent(student);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<StudentResponse> searchStudentsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return studentService.searchStudentsByName(name, page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponse getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student studentDetails) {

        Student updatedStudent =
                studentService.updateStudent(id, studentDetails);

        return ResponseEntity.ok(updatedStudent);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {

        studentService.deleteStudent(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{studentId}/room/{roomNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public Student assignRoom(
            @PathVariable Long studentId,
            @PathVariable String roomNumber) {

        return studentService.assignRoom(studentId, roomNumber);
    }

    @PutMapping("/{studentId}/room/{newRoomNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponse changeRoom(
            @PathVariable Long studentId,
            @PathVariable String newRoomNumber) {

        return studentService.changeRoom(studentId, newRoomNumber);
    }

//    @GetMapping("/page")
//    public Page<StudentResponse> getStudentsPage(
//            @RequestParam(defaultValue = "0")
//            @Min(value = 0, message = "Page number cannot be negative")
//            int page,
//
//            @RequestParam(defaultValue = "10")
//            @Min(value = 1, message = "Page size must be at least 1")
//            @Max(value = 50, message = "Page size cannot exceed 50")
//            int size) {
//
//        return studentService.getAllStudents(page, size);
//    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<StudentResponse> getStudentsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return studentService.getAllStudents(
                page,
                size,
                sortBy,
                direction
        );
    }

}