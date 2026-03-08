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

    @Column(name = "class_id")
    private String classId;

    /** B4 — Per-subject teacher assignment */
    @Column(name = "teacher_id")
    private String teacherId;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    /** B7 — Subject syllabus file URL or document reference */
    @Column(name = "syllabus_url")
    private String syllabusUrl;

    @Column(name = "syllabus_name")
    private String syllabusName;

    @PrePersist
    void prePersist() {
        if (status == null) status = "ACTIVE";
    }
}
