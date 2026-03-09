package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "exam_template_subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamTemplateSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "template_id", nullable = false)
    private String templateId;

    @Column(name = "subject_code", nullable = false)
    private String subjectCode;

    @Column(name = "day_offset")
    private Integer dayOffset;

    @Column(name = "total_marks")
    private Integer totalMarks;
}
