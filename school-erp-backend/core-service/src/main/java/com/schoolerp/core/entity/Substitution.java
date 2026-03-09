package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Records a teacher substitution for a specific date and block.
 */
@Entity
@Table(name = "substitutions", indexes = {
        @Index(name = "idx_sub_date", columnList = "date"),
        @Index(name = "idx_sub_class_id", columnList = "class_id"),
        @Index(name = "idx_sub_original_teacher", columnList = "original_teacher_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Substitution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "date", nullable = false)
    private java.time.LocalDate date;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "block_id", nullable = false)
    private String blockId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "original_teacher_id", nullable = false)
    private String originalTeacherId;

    @Column(name = "substitute_teacher_id")
    private String substituteTeacherId; // null = suggested but not confirmed

    @Column(name = "status", nullable = false)
    private String status; // SUGGESTED, CONFIRMED, CANCELLED

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (status == null)
            status = "SUGGESTED";
        createdAt = java.time.LocalDateTime.now();
    }
}
