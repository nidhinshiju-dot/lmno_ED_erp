package com.schoolerp.lms.entity.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tutor_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "sender_role", nullable = false)
    private String senderRole; // USER, AI

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
