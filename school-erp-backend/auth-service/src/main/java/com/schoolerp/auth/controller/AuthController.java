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
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/provision")
    public ResponseEntity<?> provisionAdmin(@Valid @RequestBody ProvisionRequest request) {
        try {
            User adminUser = new User();
            adminUser.setEmail(request.getEmail());
            adminUser.setPassword(request.getPassword());
            adminUser.setTenantId(request.getTenantId());
            adminUser.setRole("ADMIN"); // explicitly assigning the ADMIN role
            User registeredUser = authService.registerUser(adminUser);
            return ResponseEntity.ok(registeredUser);
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
}

@Data
class ProvisionRequest {
    private String email;
    private String password;
    private String tenantId;
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
class JwtResponse {
    private final String token;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return ResponseEntity.noContent().build();
    }
}
