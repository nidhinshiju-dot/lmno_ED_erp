package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps a teacher to a subject within a specific class, with the number of
 * periods per week.
 * Supports multiple teachers sharing the same subject in one class (e.g. Math
 * split between two teachers).
 */
@Entity
@Table(name = "class_subject_teachers", indexes = {
        @Index(name = "idx_cst_class_id", columnList = "class_id"),
        @Index(name = "idx_cst_subject_id", columnList = "subject_id"),
        @Index(name = "idx_cst_teacher_id", columnList = "teacher_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassSubjectTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId;

    /** Role of the teacher for this subject: PRIMARY or ASSISTANT */
    @Column(name = "role")
    private String role = "PRIMARY";

    /**
     * Number of periods per week this teacher teaches this subject to this class
     */
    @Column(name = "periods_per_week", nullable = false)
    private Integer periodsPerWeek = 1;

    /** Lower number = higher priority for scheduling */
    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "is_lab", nullable = false)
    private Boolean isLab = false;

    @Column(name = "consecutive_blocks", nullable = false)
    private Integer consecutiveBlocks = 1;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (periodsPerWeek == null)
            periodsPerWeek = 1;
        if (priority == null)
            priority = 0;
        if (isLab == null)
            isLab = false;
        if (consecutiveBlocks == null || consecutiveBlocks < 1)
            consecutiveBlocks = 1;
        createdAt = java.time.LocalDateTime.now();
    }
}
