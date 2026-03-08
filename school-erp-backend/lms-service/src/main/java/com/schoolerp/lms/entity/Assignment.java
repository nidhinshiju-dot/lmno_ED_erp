package com.schoolerp.lms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    private String description;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "max_score")
    private Integer maxScore;

    /** A13 — Direct class assignment (optional, in addition to course) */
    @Column(name = "class_id")
    private String classId;

    /** Link to a course module (A6) */
    @Column(name = "module_id")
    private String moduleId;
}
