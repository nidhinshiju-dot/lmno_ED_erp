package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * A6 — Course Module entity.
 * Groups lessons into modules/chapters within a course.
 * e.g. Course "Math 101" -> Module 1: "Algebra", Module 2: "Geometry"
 */
@Entity
@Table(name = "course_modules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "order_index")
    private Integer orderIndex;
}
