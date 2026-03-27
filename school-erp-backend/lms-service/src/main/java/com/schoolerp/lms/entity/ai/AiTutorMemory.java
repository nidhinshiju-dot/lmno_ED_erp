package com.schoolerp.lms.entity.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tutor_memories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "tutor_id", nullable = false, updatable = false)
    private String tutorId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private String studentId;

    @Column(name = "memory_type", nullable = false)
    private String memoryType; // TOPIC_STRUGGLE, LEARNING_PATTERN, CORRECTION

    @Column(name = "memory_key", nullable = false)
    private String memoryKey; // e.g. "struggles_with_fractions"

    @Column(name = "memory_value_json", columnDefinition = "TEXT", nullable = false)
    private String memoryValueJson; // structured JSON context instead of free text PII

    @Column(name = "importance")
    private Integer importance = 1; // 1-5 scalar

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastUsedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
