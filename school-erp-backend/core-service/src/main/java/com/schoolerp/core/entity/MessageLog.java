package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_logs")
@Getter
@Setter
public class MessageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "message_id", nullable = false)
    private String messageId; // The ID returned by Meta WhatsApp API

    @Column(name = "recipient_phone", nullable = false)
    private String recipientPhone;

    @Column(name = "status", nullable = false)
    private String status; // sent, delivered, read, failed

    @Column(name = "template_name")
    private String templateName;

    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
