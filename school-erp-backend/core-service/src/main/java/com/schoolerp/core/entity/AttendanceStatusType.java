package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "attendance_status_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatusType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. PRESENT, ABSENT, LEAVE, MEDICAL_LEAVE, LATE, HALF_DAY

    @Column(nullable = false)
    private String label; // Human-readable e.g. "Medical Leave"

    @Column(name = "is_system_default", nullable = false)
    private Boolean isSystemDefault = false; // Cannot be deleted if true
    
    @Column(nullable = false)
    private String color; // Tailwind color code e.g. "green", "red", "amber"
}
