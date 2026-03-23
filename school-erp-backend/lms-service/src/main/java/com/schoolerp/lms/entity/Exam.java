package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exams")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String classId;

    @Column(nullable = false)
    private String subjectId;

    @Column(nullable = false)
    private String teacherId;

    @Column(nullable = false)
    private LocalDate examDate;

    // e.g., "SUDDEN_TEST", "MIDTERM", "FINAL"
    @Column(nullable = false)
    private String examType;

    // e.g., "SCHEDULED", "COMPLETED"
    private String status = "SCHEDULED";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
