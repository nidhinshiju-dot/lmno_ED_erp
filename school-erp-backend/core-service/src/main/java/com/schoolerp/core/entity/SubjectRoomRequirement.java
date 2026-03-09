package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Specifies that a subject requires a particular room type (e.g. Physics →
 * Physics Lab).
 */
@Entity
@Table(name = "subject_room_requirements", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "subject_id", "room_type_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRoomRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "room_type_id", nullable = false)
    private String roomTypeId;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
}
