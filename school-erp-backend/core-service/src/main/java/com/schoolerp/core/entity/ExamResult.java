package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "exam_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "exam_id", nullable = false)
    private String examId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "marks_obtained")
    private int marksObtained;

    private String grade; // A+, A, B+, etc.

    private String remarks;

    @Column(name = "class_rank")
    private Integer classRank; // Rank within the class after result publishing

    @Column(name = "total_students")
    private Integer totalStudents; // Total students who appeared in this exam
}
