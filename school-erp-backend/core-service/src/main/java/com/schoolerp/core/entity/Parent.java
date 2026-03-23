package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;


@Entity
@Table(name = "parents")
@Getter
@Setter
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Optional but highly recommended for credentials linking
    @Column(name = "user_id", unique = true)
    private UUID userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "relation")
    private String relation;

}
