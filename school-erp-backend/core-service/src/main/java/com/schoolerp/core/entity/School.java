package com.schoolerp.core.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "schools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class School {

    @Id
    private String id; // This serves as the tenant_id

    private String name;

    private String contactEmail;

    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

}
