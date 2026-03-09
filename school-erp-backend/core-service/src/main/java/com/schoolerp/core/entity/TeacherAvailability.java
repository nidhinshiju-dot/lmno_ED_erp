package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Records when a teacher is NOT available for a specific day + period block.
 */
@Entity
@Table(name = "teacher_availability", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "teacher_id", "day_id", "block_id" })
}, indexes = {
        @Index(name = "idx_ta_teacher_id", columnList = "teacher_id"),
        @Index(name = "idx_ta_day_block", columnList = "day_id,block_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId;

    @Column(name = "day_id", nullable = false)
    private String dayId;

    @Column(name = "block_id", nullable = false)
    private String blockId;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true; // false = teacher has marked this slot unavailable
}
