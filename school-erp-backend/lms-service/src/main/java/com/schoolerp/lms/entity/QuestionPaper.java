package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "question_papers")
public class QuestionPaper {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String examId;

    @Column(nullable = false)
    private String teacherId;

    // "DRAFT", "SUBMITTED", "APPROVED"
    private String status = "DRAFT";

    // Indicates which of the 4 templates the admin chose
    private Integer printTemplateId;

    @Column(columnDefinition = "TEXT")
    private String contentData; // JSON or HTML representation of questions

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
