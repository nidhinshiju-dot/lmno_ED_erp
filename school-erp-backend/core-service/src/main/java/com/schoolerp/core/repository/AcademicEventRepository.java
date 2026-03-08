package com.schoolerp.core.repository;

import com.schoolerp.core.entity.AcademicEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AcademicEventRepository extends JpaRepository<AcademicEvent, String> {
    List<AcademicEvent> findByActiveTrueOrderByEventDateAsc();
    List<AcademicEvent> findByEventDateBetweenAndActiveTrue(LocalDate from, LocalDate to);
    List<AcademicEvent> findByTypeAndActiveTrue(String type);
}
