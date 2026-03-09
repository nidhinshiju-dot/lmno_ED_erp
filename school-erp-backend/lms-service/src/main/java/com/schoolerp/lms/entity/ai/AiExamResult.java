package com.schoolerp.lms.entity.ai;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.math.BigDecimal;

@Entity
@Table(name = "exam_results")
@Getter
public class AiExamResult {

    @Id
    private String id;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "exam_id")
    private String examId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "marks_obtained")
    private BigDecimal marksObtained;

    @Column(name = "max_marks")
    private BigDecimal maxMarks;

    private String grade;

    private String remarks;

    @Column(name = "tenant_id", updatable = false)
    private String tenantId;
}
