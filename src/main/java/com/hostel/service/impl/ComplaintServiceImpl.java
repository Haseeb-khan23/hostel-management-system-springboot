package com.hostel.service.impl;

import com.hostel.entity.Complaint;
import com.hostel.entity.ComplaintStatus;
import com.hostel.entity.Student;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.StudentRepository;
import com.hostel.service.ComplaintService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;

    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            StudentRepository studentRepository) {

        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public Complaint createComplaint(
            Long studentId,
            Complaint complaint) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId));

        complaint.setStudent(student);
        complaint.setStatus(ComplaintStatus.PENDING);
        complaint.setCreatedAt(LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    @Override
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @Override
    public Complaint getComplaintById(Long id) {

        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Complaint not found with id: " + id));
    }

    @Override
    public Complaint updateComplaint(
            Long id,
            Complaint complaintDetails) {

        Complaint existingComplaint =
                complaintRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Complaint not found with id: " + id));

        existingComplaint.setTitle(
                complaintDetails.getTitle());

        existingComplaint.setDescription(
                complaintDetails.getDescription());

        existingComplaint.setStatus(
                complaintDetails.getStatus());

        return complaintRepository.save(existingComplaint);
    }

    @Override
    public void deleteComplaint(Long id) {

        Complaint complaint =
                complaintRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Complaint not found with id: " + id));

        complaintRepository.delete(complaint);
    }
}