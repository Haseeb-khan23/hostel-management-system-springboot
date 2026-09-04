package com.hostel.service.impl;

import com.hostel.entity.Payment;
import com.hostel.entity.PaymentStatus;
import com.hostel.entity.Student;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.PaymentRepository;
import com.hostel.repository.StudentRepository;
import com.hostel.service.PaymentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            StudentRepository studentRepository) {

        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public Payment createPayment(
            Long studentId,
            Payment payment) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId));

        payment.setStudent(student);
        payment.setPaymentDate(LocalDateTime.now());

        if (payment.getStatus() == null) {
            payment.setStatus(PaymentStatus.PAID);
        }

        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment getPaymentById(Long id) {

        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found with id: " + id));
    }

    @Override
    public Payment updatePayment(
            Long id,
            Payment paymentDetails) {

        Payment existingPayment =
                paymentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found with id: " + id));

        existingPayment.setAmount(
                paymentDetails.getAmount());

        existingPayment.setPaymentMethod(
                paymentDetails.getPaymentMethod());

        existingPayment.setStatus(
                paymentDetails.getStatus());

        return paymentRepository.save(existingPayment);
    }

    @Override
    public void deletePayment(Long id) {

        Payment payment =
                paymentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found with id: " + id));

        paymentRepository.delete(payment);
    }
}