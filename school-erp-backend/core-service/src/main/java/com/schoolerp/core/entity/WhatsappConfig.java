package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "whatsapp_config")
@Getter
@Setter
public class WhatsappConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // In a multi-tenant ERP, this links to the specific School. 
    // For single-tenant DBs, this ensures one active record.
    @Column(name = "school_id", nullable = false, unique = true)
    private UUID schoolId;

    @Column(name = "phone_number_id", nullable = false)
    private String phoneNumberId;

    @Column(name = "business_account_id", nullable = false)
    private String businessAccountId;

    @Column(name = "access_token", columnDefinition = "TEXT", nullable = false)
    private String accessToken;

    @Column(name = "webhook_token", nullable = false)
    private String webhookToken;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
