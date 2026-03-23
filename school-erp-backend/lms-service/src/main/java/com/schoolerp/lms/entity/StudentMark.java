package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "student_marks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"studentId", "examId"})
})
public class StudentMark {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String examId;

    @Column(nullable = false)
    private Double normalizedScore;

    private String grade;

    @Column(columnDefinition = "TEXT")
    private String aiInsightsData; // JSON blob for insights

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
