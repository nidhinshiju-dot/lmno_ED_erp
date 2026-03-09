package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "academic_year", nullable = false)
    private String academicYear; // e.g. "2025-2026"

    @Column(name = "term")
    private String term; // e.g. "Term 1", "Semester 1"

    @Column(name = "status", nullable = false)
    private String status; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (status == null)
            status = "DRAFT";
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
