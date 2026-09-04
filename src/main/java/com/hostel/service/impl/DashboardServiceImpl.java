package com.hostel.service.impl;

import com.hostel.dto.DashboardResponse;
import com.hostel.entity.ComplaintStatus;
import com.hostel.entity.PaymentStatus;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.PaymentRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import com.hostel.service.DashboardService;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final ComplaintRepository complaintRepository;
//    private final PaymentRepository paymentRepository;

    public DashboardServiceImpl(
            StudentRepository studentRepository,
            RoomRepository roomRepository,
            ComplaintRepository complaintRepository,
            PaymentRepository paymentRepository) {

        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.complaintRepository = complaintRepository;
//        this.paymentRepository = paymentRepository;
    }

    @Override
    public DashboardResponse getAdminDashboard() {

        long totalStudents = studentRepository.count();

        long totalRooms = roomRepository.count();

        long occupiedRooms = roomRepository.findAll()
                .stream()
                .filter(room ->
                        room.getCurrentOccupants() >= room.getCapacity())
                .count();

        long availableRooms = roomRepository.findAll()
                .stream()
                .filter(room ->
                        room.getCurrentOccupants() < room.getCapacity())
                .count();



        long pendingComplaints =
                complaintRepository.countByStatus(
                        ComplaintStatus.PENDING
                );

        long pendingPayments =
                studentRepository.countByPaymentStatus(
                        PaymentStatus.PENDING
                );

        return new DashboardResponse(
                totalStudents,
                totalRooms,
                occupiedRooms,
                availableRooms,
                pendingComplaints,
                pendingPayments
        );
    }
}