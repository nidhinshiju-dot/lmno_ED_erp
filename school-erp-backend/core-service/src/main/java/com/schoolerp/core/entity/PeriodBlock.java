package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "period_blocks", indexes = {
        @Index(name = "idx_period_blocks_type", columnList = "block_type"),
        @Index(name = "idx_period_blocks_order", columnList = "order_index")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PeriodBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "block_name", nullable = false)
    private String blockName; // "Period 1", "Lunch Break", "Session 1"

    @Column(name = "block_type", nullable = false)
    private String blockType; // PERIOD, BREAK, LUNCH

    @Column(name = "start_time", nullable = false)
    private String startTime; // "09:00"

    @Column(name = "end_time", nullable = false)
    private String endTime; // "09:45"

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex; // display order in the day

    @PrePersist
    void prePersist() {
        if (blockType == null)
            blockType = "PERIOD";
    }
}
