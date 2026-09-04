package com.hostel.repository;

import com.hostel.entity.Complaint;
import com.hostel.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    long countByStatus(ComplaintStatus status);

    List<Complaint> findByStudent_User_Username(String username);
}