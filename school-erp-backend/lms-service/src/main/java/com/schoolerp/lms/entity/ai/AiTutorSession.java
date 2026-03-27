package com.schoolerp.lms.entity.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tutor_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "tutor_id", nullable = false)
    private String tutorId;

    @Column(name = "session_start", nullable = false)
    private LocalDateTime sessionStart;

    @Column(name = "session_end")
    private LocalDateTime sessionEnd;

    @PrePersist
    void prePersist() {
        if (sessionStart == null) sessionStart = LocalDateTime.now();
    }
}
