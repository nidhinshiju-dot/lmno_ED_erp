package com.schoolerp.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ADMIN, TEACHER, STUDENT, PARENT

    @Column(name = "tenant_id")
    private String tenantId; // null for SUPER_ADMIN (platform-level, no tenant)
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;

    @Column(name = "requires_password_reset", nullable = false)
    private Boolean requiresPasswordReset = true;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "reset_token_hash")
    private String resetTokenHash;

    @Column(name = "reset_token_expiry")
    private Long resetTokenExpiry;

    @Column(name = "reset_token_purpose")
    private String resetTokenPurpose;

    @Column(name = "is_active")
    private boolean isActive = true;
}
