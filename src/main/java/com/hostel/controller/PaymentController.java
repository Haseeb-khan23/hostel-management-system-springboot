package com.hostel.controller;

import com.hostel.entity.Payment;
import com.hostel.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
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
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Payment> getMyPayments(
            @AuthenticationPrincipal UserDetails userDetails) {

        return paymentService.getPaymentsForUser(
                userDetails.getUsername()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Payment getPaymentById(
            @PathVariable Long id) {

        return paymentService.getPaymentById(id);
    }

    @PostMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Payment createPayment(
            @PathVariable Long studentId,
            @Valid @RequestBody Payment payment) {

        return paymentService.createPayment(
                studentId,
                payment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody Payment paymentDetails) {

        Payment updatedPayment =
                paymentService.updatePayment(
                        id,
                        paymentDetails);

        return ResponseEntity.ok(updatedPayment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long id) {

        paymentService.deletePayment(id);

        return ResponseEntity.noContent().build();
    }
}