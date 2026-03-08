package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FileDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "file_type")
    private String fileType; // PDF, IMAGE, DOC, EXCEL

    @Column(name = "file_size")
    private long fileSize; // bytes

    @Column(nullable = false)
    private String category; // STUDENT_DOC, CERTIFICATE, CIRCULAR, ASSIGNMENT, OTHER

    @Column(name = "reference_id")
    private String referenceId; // studentId, classId, etc.

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "file_path")
    private String filePath; // storage path

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    void prePersist() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}
