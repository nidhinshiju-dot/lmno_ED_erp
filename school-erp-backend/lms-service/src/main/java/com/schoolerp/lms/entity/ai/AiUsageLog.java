package com.schoolerp.lms.entity.ai;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_usage_logs")
@Data
public class AiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "tutor_id", nullable = false)
    private String tutorId;

    @Column(name = "endpoint", nullable = false)
    private String endpoint;

    @Column(name = "prompt_tokens")
    private Integer promptTokens = 0;

    @Column(name = "completion_tokens")
    private Integer completionTokens = 0;

    @Column(name = "model_used", nullable = false)
    private String modelUsed;

    @Column(name = "model_requested")
    private String modelRequested;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "status")
    private String status;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "cache_hit")
    private Boolean cacheHit = false;

    @Column(name = "cache_write_tokens")
    private Integer cacheWriteTokens = 0;

    @Column(name = "cache_read_tokens")
    private Integer cacheReadTokens = 0;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}
