package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "admission_number", unique = true, nullable = false)
    private String admissionNumber;

    @Column(nullable = false)
    private String name;

    private LocalDate dob;

    private String address;

    @Column(name = "parent_contact")
    private String parentContact;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_relation")
    private String guardianRelation;

    @Column(name = "parent_id")
    private String parentId;

    @Column(name = "class_id")
    private String classId;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, ALUMNI, TRANSFERRED

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @PrePersist
    void prePersist() {
        if (status == null)
            status = "ACTIVE";
        if (admissionNumber == null || admissionNumber.trim().isEmpty()) {
            String datePrefix = java.time.LocalDate.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            int randomSeq = java.util.concurrent.ThreadLocalRandom.current().nextInt(1000, 9999);
            admissionNumber = datePrefix + randomSeq;
        }
    }
}
