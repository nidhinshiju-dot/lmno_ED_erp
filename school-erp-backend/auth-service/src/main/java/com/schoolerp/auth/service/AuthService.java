package com.schoolerp.auth.service;

import com.schoolerp.auth.config.JwtUtil;
import com.schoolerp.auth.entity.User;
import com.schoolerp.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Hash the password securely
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public String loginUser(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Verify matched password against hashed DB value
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                // Return a signed JWT to the user
                return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getTenantId());
            }
        }
        
        throw new RuntimeException("Invalid credentials");
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Autowired
    private EmailService emailService;

    public void resetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String tempPassword = "Reset@" + (int)(Math.random() * 10000);
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
        
        // Send actual email with temp password
        emailService.sendPasswordResetEmail(email, tempPassword);
    }
}
