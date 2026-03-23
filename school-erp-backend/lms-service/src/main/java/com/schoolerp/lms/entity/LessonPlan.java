package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "lesson_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LessonPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId; // The ID of the teacher who owns this plan

    @Column(name = "class_subject_teacher_id", nullable = false)
    private String classSubjectTeacherId; // The specific assignment

    @Column(name = "grade_level")
    private Integer gradeLevel; // Used for easy filtering when sharing

    @Column(nullable = false)
    private String title;

    @Column(name = "content_url")
    private String contentUrl; // Nullable if content is just text or not uploaded yet

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, VERIFIED

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
