package com.schoolerp.lms.entity.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tutor_insights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "tutor_id", nullable = false, updatable = false)
    private String tutorId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private String studentId;

    @Column(name = "course_id")
    private String courseId;

    @Column(name = "insight_type", nullable = false)
    private String insightType; // WEAK_TOPIC, STRONG_TOPIC, REVISION_PRIORITY, EXAM_READINESS, ATTENDANCE_HINT, PRACTICE_RECOMMENDATION

    @Column(name = "topic_key")
    private String topicKey;

    @Column(name = "topic_label")
    private String topicLabel;

    @Column(name = "score")
    private Double score;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "source_snapshot_json", columnDefinition = "TEXT")
    private String sourceSnapshotJson;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        generatedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
