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

    @Column(name = "parent_id")
    private String parentId;

    @Column(name = "section_id")
    private String sectionId;

    @Column(name = "class_id")
    private String classId;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, ALUMNI, TRANSFERRED

    @PrePersist
    void prePersist() {
        if (status == null) status = "ACTIVE";
    }
}
