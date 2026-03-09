package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * A single timetable slot: one class → one period block on one weekday,
 * assigned to a subject+teacher+room.
 * Unique constraint: one class can only have one subject per day+block.
 */
@Entity
@Table(name = "class_timetable", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "timetable_id", "class_id", "day_id", "block_id" })
}, indexes = {
        @Index(name = "idx_ct_timetable_id", columnList = "timetable_id"),
        @Index(name = "idx_ct_class_id", columnList = "class_id"),
        @Index(name = "idx_ct_day_id", columnList = "day_id"),
        @Index(name = "idx_ct_block_id", columnList = "block_id"),
        @Index(name = "idx_ct_room_id", columnList = "room_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassTimetable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "timetable_id", nullable = false)
    private String timetableId;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "day_id", nullable = false)
    private String dayId; // FK → working_days

    @Column(name = "block_id", nullable = false)
    private String blockId; // FK → period_blocks

    @Column(name = "class_subject_teacher_id", nullable = false)
    private String classSubjectTeacherId; // FK → class_subject_teachers

    @Column(name = "room_id")
    private String roomId; // FK → rooms (nullable)

    @Column(name = "is_locked")
    private Boolean isLocked = false; // if true, auto-gen cannot overwrite

    @PrePersist
    void prePersist() {
        if (isLocked == null)
            isLocked = false;
    }
}
