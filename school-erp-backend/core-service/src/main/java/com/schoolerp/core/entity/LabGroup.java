package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "name", nullable = false)
    private String name; // e.g., "Science Labs", "Computer Labs"
}
