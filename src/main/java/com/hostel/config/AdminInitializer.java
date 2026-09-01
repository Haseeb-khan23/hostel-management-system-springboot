package com.hostel.config;

import com.hostel.entity.Role;
import com.hostel.entity.User;
import com.hostel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner createUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (userRepository.findByUsername("admin").isEmpty()) {

                User admin = new User();

                admin.setUsername("admin");
                admin.setPassword(
                        passwordEncoder.encode("admin123")
                );
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println(
                        "Default admin user created successfully."
                );
            }

            if (userRepository.findByUsername("student").isEmpty()) {

                User student = new User();

                student.setUsername("student");
                student.setPassword(
                        passwordEncoder.encode("student123")
                );
                student.setRole(Role.STUDENT);

                userRepository.save(student);

                System.out.println(
                        "Default student user created successfully."
                );
            }
        };
    }
}