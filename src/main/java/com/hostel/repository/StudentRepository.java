package com.hostel.repository;

import com.hostel.entity.PaymentStatus;
import com.hostel.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByRoom_RoomNumber(String roomNumber);
    Page<Student> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );

    long countByPaymentStatus(PaymentStatus paymentStatus);
    Optional<Student> findByUser_Username(String username);
}