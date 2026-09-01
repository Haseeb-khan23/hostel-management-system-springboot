package com.hostel.controller;

import com.hostel.entity.Complaint;
import com.hostel.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
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
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(
            ComplaintService complaintService) {

        this.complaintService = complaintService;
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @GetMapping("/{id}")
    public Complaint getComplaintById(
            @PathVariable Long id) {

        return complaintService.getComplaintById(id);
    }

    @PostMapping("/student/{studentId}")
    public Complaint createComplaint(
            @PathVariable Long studentId,
            @Valid @RequestBody Complaint complaint) {

        return complaintService.createComplaint(
                studentId,
                complaint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody Complaint complaintDetails) {

        Complaint updatedComplaint =
                complaintService.updateComplaint(
                        id,
                        complaintDetails);

        return ResponseEntity.ok(updatedComplaint);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(
            @PathVariable Long id) {

        complaintService.deleteComplaint(id);

        return ResponseEntity.noContent().build();
    }
}