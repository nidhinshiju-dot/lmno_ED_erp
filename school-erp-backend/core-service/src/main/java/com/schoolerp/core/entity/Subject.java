package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Column(name = "subject_type")
    private String subjectType; // CORE, ELECTIVE, OPTIONAL

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    /** B7 — Subject syllabus file URL or document reference */
    @Column(name = "syllabus_url")
    private String syllabusUrl;

    @Column(name = "syllabus_name")
    private String syllabusName;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (status == null)
            status = "ACTIVE";
        if (code == null || code.trim().isEmpty()) {
            String prefix = "SUBJ";
            if (name != null) {
                String cleanName = name.replaceAll("[^a-zA-Z0-9]", "");
                if (cleanName.length() >= 4) {
                    prefix = cleanName.substring(0, 4).toUpperCase();
                } else if (!cleanName.isEmpty()) {
                    prefix = String.format("%-4s", cleanName.toUpperCase()).replace(' ', 'X');
                }
            }
            int randomSeq = java.util.concurrent.ThreadLocalRandom.current().nextInt(100, 1000);
            code = prefix + randomSeq;
        }
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
