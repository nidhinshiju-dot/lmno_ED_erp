package com.schoolerp.lms.entity.ai;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDate;

@Entity
@Table(name = "attendance")
@Getter
public class AiAttendance {

    @Id
    private String id;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "class_id")
    private String classId;

    private LocalDate date;

    private String status; // PRESENT, ABSENT, LATE, HALF_DAY

    private String remarks;

    @Column(name = "tenant_id", updatable = false)
    private String tenantId;
}
