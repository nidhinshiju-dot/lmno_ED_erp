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

    @Column(name = "user_id", nullable = false)
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
    private String phone;

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    /** B1/B6 — Account activation status: ACTIVE, INACTIVE */
    private String status;

    @PrePersist
    void prePersist() {
        if (status == null) status = "ACTIVE";
        if (employeeId == null || employeeId.trim().isEmpty()) {
            String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            int randomSeq = java.util.concurrent.ThreadLocalRandom.current().nextInt(1000, 9999);
            employeeId = datePrefix + randomSeq;
        }
    }
}

