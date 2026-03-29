package com.schoolerp.auth.service;

import com.schoolerp.auth.config.JwtUtil;
import com.schoolerp.auth.entity.User;
import com.schoolerp.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.security.SecureRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @org.springframework.beans.factory.annotation.Value("${core-service.url:http://localhost:8083}")
    private String coreServiceUrl;

    private String fetchStaffId(String userId, String role) {
        if ("SUPER_ADMIN".equals(role) || "STUDENT".equals(role) || "PARENT".equals(role)) {
            return null;
        }
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = coreServiceUrl + "/api/v1/staff/user/" + userId;
            java.util.Map response = restTemplate.getForObject(url, java.util.Map.class);
            if (response != null && response.containsKey("id")) {
                return (String) response.get("id");
            }
        } catch (Exception e) {
            System.err.println("Failed to resolve staffId for userId " + userId + ": " + e.getMessage());
        }
        return null;
    }

    public String generateSecurePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

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
            if (!user.isActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            System.out.println("DEBUG LOGIN: User found. DB hash is: " + user.getPassword());
            // Verify matched password against hashed DB value
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                System.out.println("DEBUG LOGIN: Password MATCHES! Generating token...");
                
                if (user.getRequiresPasswordReset() != null && user.getRequiresPasswordReset()) {
                    System.out.println("DEBUG LOGIN: Password reset required.");
                    throw new PasswordResetRequiredException("You must change your temporary password before accessing the system.");
                }
                
                // Use natively stored reference_id (staffId pointer) to prevent synchronous callback. Fallback to HTTP for legacy unmigrated records.
                String staffId = user.getReferenceId() != null
                        ? user.getReferenceId()
                        : fetchStaffId(user.getId(), user.getRole());
                
                // Return a signed JWT to the user
                return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getTenantId(), staffId);
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
        user.setRequiresPasswordReset(false);
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

    private String hashToken(String token) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    /** Generate a secure random reset token (valid for 24h). */
    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No login account exists for email"));
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is deactivated");
        }
        long expiryMs = System.currentTimeMillis() + 86_400_000L; // 24h
        
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        String rawToken = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        
        String tokenHash = hashToken(rawToken);
        String purpose = (user.getRequiresPasswordReset() != null && user.getRequiresPasswordReset()) 
                         ? "INITIAL_PROVISIONING" : "PASSWORD_RESET";
        
        user.setResetTokenHash(tokenHash);
        user.setResetTokenExpiry(expiryMs);
        user.setResetTokenPurpose(purpose);
        userRepository.save(user);
        
        log.info("AUTH_AUDIT: Generated {} token for email [{}] expiring at {}", purpose, email, expiryMs);
        
        return rawToken;
    }

    /** Validate token and update password — NO old password required. */
    public void resetPasswordByToken(String token, String newPassword) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Token cannot be blank.");
        }
        
        String tokenHash = hashToken(token);
        
        User user = userRepository.findByResetTokenHash(tokenHash)
                .orElseThrow(() -> {
                    log.warn("AUTH_AUDIT: Attempted to use invalid or forged reset token.");
                    return new RuntimeException("Invalid or malformed token.");
                });
                
        if (System.currentTimeMillis() > user.getResetTokenExpiry()) {
            log.warn("AUTH_AUDIT: Attempted to use expired {} token for user [{}]", user.getResetTokenPurpose(), user.getEmail());
            user.setResetTokenHash(null);
            user.setResetTokenExpiry(null);
            user.setResetTokenPurpose(null);
            userRepository.save(user);
            throw new RuntimeException("Reset link has expired. Please generate a new one.");
        }
        
        String purposeUsed = user.getResetTokenPurpose();
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setRequiresPasswordReset(false);
        user.setResetTokenHash(null);
        user.setResetTokenExpiry(null);
        user.setResetTokenPurpose(null);
        userRepository.save(user);
        
        log.info("AUTH_AUDIT: Successfully used {} token for user [{}]. Token revoked.", purposeUsed, user.getEmail());
    }

    public void deactivateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        user.setResetTokenHash(null);
        user.setResetTokenExpiry(null);
        user.setResetTokenPurpose(null);
        userRepository.save(user);
        log.info("AUTH_AUDIT: Deactivated user [{}]", user.getEmail());
    }
}
