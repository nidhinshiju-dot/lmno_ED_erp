package com.schoolerp.lms.entity.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tutor_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "tutor_id", nullable = false, updatable = false)
    private String tutorId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private String studentId;

    @Column(name = "explanation_style")
    private String explanationStyle = "BALANCED"; // BRIEF, BALANCED, DETAILED, SOCRATIC

    @Column(name = "answer_length")
    private String answerLength = "MODERATE"; // SHORT, MODERATE, LONG

    @Column(name = "prefer_examples")
    private Boolean preferExamples = true;

    @Column(name = "prefer_formulas")
    private Boolean preferFormulas = true;

    @Column(name = "prefer_theory")
    private Boolean preferTheory = true;

    @Column(name = "goal_type")
    private String goalType = "GENERAL_MASTERY"; // EXAM_PREP, GENERAL_MASTERY, QUICK_HELP

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void prePersist() {
        updatedAt = LocalDateTime.now();
    }
}
