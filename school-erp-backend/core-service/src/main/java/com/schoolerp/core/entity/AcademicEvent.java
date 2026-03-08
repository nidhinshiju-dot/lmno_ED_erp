package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "academic_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AcademicEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false)
    private String type; // HOLIDAY, EXAM_PERIOD, EVENT, PARENT_MEETING

    @Column(nullable = false)
    private boolean active;

    @PrePersist
    void prePersist() {
        active = true;
    }
}
