package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "campuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Campus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String state;
    private String phone;

    @Column(name = "is_main", nullable = false)
    private boolean main;

    @Column(nullable = false)
    private boolean active;

    @PrePersist
    void prePersist() {
        active = true;
    }
}
