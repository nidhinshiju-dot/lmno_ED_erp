package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "working_days", indexes = {
        @Index(name = "idx_working_days_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkingDay {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "day_name", nullable = false)
    private String dayName; // MONDAY, TUESDAY, ... SATURDAY

    @Column(name = "day_order", nullable = false)
    private Integer dayOrder; // 1=Mon, 2=Tue, ..., 6=Sat

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    void prePersist() {
        if (isActive == null)
            isActive = true;
    }
}
