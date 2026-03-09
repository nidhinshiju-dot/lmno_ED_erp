package com.schoolerp.lms.entity.ai;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Getter
public class AiStudent {

    @Id
    private String id;

    @Column(name = "admission_number")
    private String admissionNumber;

    private String name;

    private LocalDate dob;

    @Column(name = "parent_contact")
    private String parentContact;

    @Column(name = "tenant_id", updatable = false)
    private String tenantId;
}
