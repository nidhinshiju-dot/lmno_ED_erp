package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms", indexes = {
        @Index(name = "idx_rooms_type", columnList = "room_type_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "room_name", nullable = false)
    private String roomName; // "Room 101", "Physics Lab", "CS Lab A"

    @Column(name = "room_type_id", nullable = false)
    private String roomTypeId; // FK → room_types

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "building")
    private String building;

    @Column(name = "floor")
    private String floor;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @PrePersist
    void prePersist() {
        if (isActive == null)
            isActive = true;
    }
}
