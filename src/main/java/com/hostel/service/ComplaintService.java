package com.hostel.service;

import com.hostel.entity.Complaint;

import java.util.List;

public interface ComplaintService {

    Complaint createComplaint(
            Long studentId,
            Complaint complaint
    );

    List<Complaint> getAllComplaints();

    Complaint getComplaintById(Long id);

    Complaint updateComplaint(
            Long id,
            Complaint complaintDetails
    );

    void deleteComplaint(Long id);
}