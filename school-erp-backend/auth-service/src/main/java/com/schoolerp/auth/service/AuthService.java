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
        System.out.println("DEBUG LOGIN: Attempting to find user with email: " + email);
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("DEBUG LOGIN: User found. DB hash is: " + user.getPassword());
            // Verify matched password against hashed DB value
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                System.out.println("DEBUG LOGIN: Password MATCHES! Generating token...");
                // Return a signed JWT to the user
                return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getTenantId());
            } else {
                System.out.println("DEBUG LOGIN: Password DOES NOT match.");
            }
        } else {
            System.out.println("DEBUG LOGIN: User NOT FOUND by findByEmail.");
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

    /** Generate a time-limited reset token (valid for 24h). */
    public String generateResetToken(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        long expiryMs = System.currentTimeMillis() + 86_400_000L; // 24h
        String payload = email + "|" + expiryMs;
        return java.util.Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    /** Validate token and update password — NO old password required. */
    public void resetPasswordByToken(String token, String newPassword) {
        String decoded;
        try {
            decoded = new String(java.util.Base64.getUrlDecoder().decode(token),
                    java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or malformed token.");
        }
        String[] parts = decoded.split("\\|");
        if (parts.length != 2) throw new RuntimeException("Invalid token structure.");
        String email = parts[0];
        long expiry = Long.parseLong(parts[1]);
        if (System.currentTimeMillis() > expiry) throw new RuntimeException("Reset link has expired. Please generate a new one.");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
