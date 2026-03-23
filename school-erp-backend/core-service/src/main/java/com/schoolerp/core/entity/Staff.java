package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "staff")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String designation;

    /** Role within the system: TEACHER, ADMIN, ACCOUNTANT, etc. */
    private String role;

    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    /** B1/B6 — Account activation status: ACTIVE, INACTIVE */
    private String status;

    private String dob;

    @Column(name = "join_date")
    private String joinDate;

    @Column(name = "highest_qualification")
    private String highestQualification;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String gender;

    /** FULL_TIME, PART_TIME */
    @Column(name = "teacher_type")
    private String teacherType = "FULL_TIME";

    /** Maximum weekly periods */
    @Column(name = "max_periods")
    private Integer maxPeriods = 30;

    /** Workload ratio (e.g. 1.0 for full-time) */
    @Column(name = "workload_ratio")
    private Double workloadRatio = 1.0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "staff_subjects", joinColumns = @JoinColumn(name = "staff_id"))
    @Column(name = "subject_id")
    private java.util.List<String> subjects;

    @PrePersist
    void prePersist() {
        if (status == null)
            status = "ACTIVE";
        if (employeeId == null || employeeId.trim().isEmpty()) {
            String datePrefix = java.time.LocalDate.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            int randomSeq = java.util.concurrent.ThreadLocalRandom.current().nextInt(1000, 9999);
            employeeId = datePrefix + randomSeq;
        }
    }
}
