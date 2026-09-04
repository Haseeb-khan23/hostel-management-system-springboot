package com.hostel.service.impl;

import com.hostel.dto.LoginRequest;
import com.hostel.dto.LoginResponse;
import com.hostel.entity.Role;
import com.hostel.entity.Student;
import com.hostel.entity.User;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.StudentRepository;
import com.hostel.repository.UserRepository;
import com.hostel.security.JwtService;
import com.hostel.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final StudentRepository studentRepository;
//    public AuthServiceImpl(
//            AuthenticationManager authenticationManager,
//            UserRepository userRepository,
//            JwtService jwtService) {
//
//        this.authenticationManager = authenticationManager;
//        this.userRepository = userRepository;
//        this.jwtService = jwtService;
//    }
public AuthServiceImpl(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService,
        StudentRepository studentRepository) {

    this.authenticationManager = authenticationManager;
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.studentRepository = studentRepository;
}

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow();

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        Long studentId = null;

        if (user.getRole() == Role.STUDENT) {
            studentId = studentRepository
                    .findByUser_Username(user.getUsername())
                    .map(Student::getId)
                    .orElse(null);
        }

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole().name(),
                studentId
        );
    }

}