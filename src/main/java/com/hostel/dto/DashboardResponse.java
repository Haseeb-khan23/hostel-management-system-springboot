package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardResponse {

    private long totalStudents;
    private long totalRooms;
    private long occupiedRooms;
    private long availableRooms;
    private long pendingComplaints;
    private long pendingPayments;
}