package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_lab_group_requirements", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "subject_id", "lab_group_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectLabGroupRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "subject_id", nullable = false)
    private String subjectId; // FK to subjects

    @Column(name = "lab_group_id", nullable = false)
    private String labGroupId; // FK to lab_groups
}
