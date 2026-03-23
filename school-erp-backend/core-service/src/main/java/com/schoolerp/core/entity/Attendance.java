package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "period_block_id")
    private String periodBlockId; // Nullable, used only in PERIOD mode

    @Column(nullable = false)
    private String status; // PRESENT, ABSENT, LEAVE, MEDICAL_LEAVE, LATE_ENTRY, HALF_DAY

    @Column(name = "recorded_by")
    private String recordedBy; // User ID who marked attendance

    @Column(name = "recorded_role")
    private String recordedRole; // TEACHER or ADMIN

    private String remarks;
}
