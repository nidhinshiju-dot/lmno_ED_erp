package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Denormalized teacher schedule for fast conflict detection.
 * Written every time a ClassTimetable slot is created/updated.
 */
@Entity
@Table(name = "teacher_schedule", indexes = {
        @Index(name = "idx_ts_teacher_id", columnList = "teacher_id"),
        @Index(name = "idx_ts_day_block", columnList = "day_id,block_id"),
        @Index(name = "idx_ts_timetable_id", columnList = "timetable_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeacherSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "timetable_id", nullable = false)
    private String timetableId;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId;

    @Column(name = "day_id", nullable = false)
    private String dayId;

    @Column(name = "block_id", nullable = false)
    private String blockId;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "room_id")
    private String roomId;
}
