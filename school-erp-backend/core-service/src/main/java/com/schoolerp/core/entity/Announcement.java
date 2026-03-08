package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String scope; // SCHOOL, CLASS, TEACHER, PARENT

    @Column(name = "target_id")
    private String targetId; // classId if scope = CLASS

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String priority; // HIGH, NORMAL, LOW

    @Column(nullable = false)
    private boolean active;

    /** B12 — Scheduled publishing: set a future datetime to auto-publish */
    @Column(name = "publish_at")
    private LocalDateTime publishAt;

    /**
     * Announcement lifecycle status:
     * DRAFT — not yet visible, SCHEDULED — will publish at publishAt, PUBLISHED — live
     */
    @Column(name = "publish_status")
    private String publishStatus; // DRAFT, SCHEDULED, PUBLISHED

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        active = true;
        if (priority == null) priority = "NORMAL";
        if (publishStatus == null) {
            publishStatus = (publishAt != null) ? "SCHEDULED" : "PUBLISHED";
        }
    }
}
