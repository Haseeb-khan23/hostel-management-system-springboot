package com.hostel.dto;

import com.hostel.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private String name;
    private String mobileNo;
    private String course;
    private String address;
    private PaymentStatus paymentStatus;
    private String roomNumber;
}