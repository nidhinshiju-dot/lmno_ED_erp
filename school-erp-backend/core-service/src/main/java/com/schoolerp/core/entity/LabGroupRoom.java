package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_group_rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "lab_group_id", "room_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabGroupRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "lab_group_id", nullable = false)
    private String labGroupId; // FK to lab_groups

    @Column(name = "room_id", nullable = false)
    private String roomId; // FK to rooms
}
