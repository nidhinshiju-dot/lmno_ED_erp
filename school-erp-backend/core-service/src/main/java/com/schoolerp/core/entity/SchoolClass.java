package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "grade_level")
    private Integer gradeLevel;

    @Column
    private String branch;

    @Column(columnDefinition = "integer default 40")
    private Integer capacity;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "class_teacher_id")
    private String classTeacherId;
}
