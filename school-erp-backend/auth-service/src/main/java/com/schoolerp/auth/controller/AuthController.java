package com.schoolerp.auth.controller;

import com.schoolerp.auth.entity.User;
import com.schoolerp.auth.service.AuthService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private javax.sql.DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            stmt.executeQuery("SELECT 1");
            return ResponseEntity.ok(java.util.Map.of("status", "UP", "database", "CONNECTED"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(java.util.Map.of("status", "DOWN", "error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User registeredUser = authService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (com.schoolerp.auth.service.PasswordResetRequiredException e) {
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("error", "PASSWORD_RESET_REQUIRED");
            resp.put("message", e.getMessage());
            resp.put("token", null);
            resp.put("requiresPasswordReset", true);
            return ResponseEntity.status(403).body(resp);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/provision")
    public ResponseEntity<?> provisionAdmin(@Valid @RequestBody ProvisionRequest request) {
        try {
            java.util.Optional<User> existingUserOpt = authService.findByEmail(request.getEmail());
            if (existingUserOpt.isPresent()) {
                User u = existingUserOpt.get();
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("id", u.getId());
                response.put("email", u.getEmail());
                response.put("role", u.getRole());
                response.put("temporaryPassword", "Already Provisioned");
                response.put("requiresPasswordReset", u.getRequiresPasswordReset());
                return ResponseEntity.ok(response);
            }

            User adminUser = new User();
            adminUser.setEmail(request.getEmail());
            adminUser.setTenantId(request.getTenantId());
            adminUser.setRole(request.getRole() != null ? request.getRole() : "ADMIN");
            adminUser.setReferenceId(request.getReferenceId());
            
            String plainPassword = request.getPassword();
            if (plainPassword == null || plainPassword.isEmpty()) {
                plainPassword = authService.generateSecurePassword();
            }
            adminUser.setPassword(plainPassword); // Service will hash it
            adminUser.setRequiresPasswordReset(true);
            
            User registeredUser = authService.registerUser(adminUser);
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("email", registeredUser.getEmail());
            response.put("role", registeredUser.getRole());
            response.put("temporaryPassword", plainPassword);
            response.put("requiresPasswordReset", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            authService.changePassword(request.getEmail(), request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail());
            return ResponseEntity.ok("Password reset. Temporary password: Reset@123");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @PostMapping("/generate-reset-token")
    public ResponseEntity<?> generateResetToken(@RequestBody GenerateResetTokenRequest request) {
        try {
            String token = authService.generateResetToken(request.getEmail());
            return ResponseEntity.ok(java.util.Map.of("token", token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @PatchMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        try {
            authService.deactivateUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password-by-token")
    public ResponseEntity<?> resetPasswordByToken(@RequestBody ResetByTokenRequest request) {
        try {
            authService.resetPasswordByToken(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}

@Data
class ProvisionRequest {
    private String email;
    private String password;
    private String tenantId;
    private String role;
    private String referenceId;
}

@Data
class ChangePasswordRequest {
    private String email;
    private String oldPassword;
    private String newPassword;
}

@Data
class ResetPasswordRequest {
    private String email;
}

@Data
class LoginRequest {
    private String email;
    private String password;
}

@Data
class GenerateResetTokenRequest {
    private String email;
}

@Data
class ResetByTokenRequest {
    private String token;
    private String newPassword;
}

@Data
class JwtResponse {
    private final String token;
}
