package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "attendance_id", nullable = false)
    private String attendanceId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "changed_by_user_id", nullable = false)
    private String changedByUserId;

    @Column(name = "user_role", nullable = false)
    private String userRole; // TEACHER, ADMIN

    @Column(name = "old_status")
    private String oldStatus; // PRESENT, ABSENT, etc. Or Null for first entry

    @Column(name = "new_status", nullable = false)
    private String newStatus;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
