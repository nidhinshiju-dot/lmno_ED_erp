package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "teacher_id")
    private String teacherId; // References Staff ID from Core Service

    @Column(name = "class_id")
    private String classId;

    @Column(nullable = false)
    private String status; // DRAFT, PUBLISHED, ARCHIVED

    @PrePersist
    void prePersist() {
        if (status == null) status = "DRAFT";
    }
}
