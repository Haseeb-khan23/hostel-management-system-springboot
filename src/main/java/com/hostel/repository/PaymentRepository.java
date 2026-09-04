package com.hostel.repository;

import com.hostel.entity.Payment;
import com.hostel.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    long countByStatus(PaymentStatus status);

    List<Payment> findByStudent_User_Username(String username);
}