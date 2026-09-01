package com.hostel.repository;

import com.hostel.entity.Complaint;
import com.hostel.entity.ComplaintStatus;
import com.hostel.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    long countByStatus(ComplaintStatus status);
}