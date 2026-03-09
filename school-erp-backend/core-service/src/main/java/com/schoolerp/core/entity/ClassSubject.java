package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "class_subjects", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "class_id", "subject_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "teacher_id")
    private String teacherId;

    @Column(name = "periods_per_week")
    private Integer periodsPerWeek;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
