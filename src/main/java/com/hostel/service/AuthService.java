package com.hostel.service;

import com.hostel.dto.LoginRequest;
import com.hostel.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}