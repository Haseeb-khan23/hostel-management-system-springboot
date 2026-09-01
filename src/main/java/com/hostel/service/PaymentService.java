package com.hostel.service;

import com.hostel.entity.Payment;

import java.util.List;

public interface PaymentService {

    Payment createPayment(
            Long studentId,
            Payment payment
    );

    List<Payment> getAllPayments();

    Payment getPaymentById(Long id);

    Payment updatePayment(
            Long id,
            Payment paymentDetails
    );

    void deletePayment(Long id);
}