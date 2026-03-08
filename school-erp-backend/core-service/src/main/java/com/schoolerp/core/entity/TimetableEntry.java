package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "timetable_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String sectionId;

    @Column(nullable = false)
    private String day; // MON, TUE, WED, THU, FRI, SAT

    @Column(nullable = false)
    private int period; // 1-8

    @Column(nullable = false)
    private String subject;

    private String teacherId;
}
