package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "syllabi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "uploaded_by_user_id")
    private String uploadedByUserId;

    @Column(name = "uploaded_by_staff_id")
    private String uploadedByStaffId;

    @Column(name = "status")
    private String status = "VERIFIED";

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
        if (status == null) status = "VERIFIED";
        if (version == null) version = 1;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
