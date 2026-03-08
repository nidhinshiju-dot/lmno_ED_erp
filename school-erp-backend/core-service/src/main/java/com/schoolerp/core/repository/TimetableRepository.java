package com.schoolerp.core.repository;

import com.schoolerp.core.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableRepository extends JpaRepository<TimetableEntry, String> {
    List<TimetableEntry> findBySectionIdOrderByDayAscPeriodAsc(String sectionId);
}
