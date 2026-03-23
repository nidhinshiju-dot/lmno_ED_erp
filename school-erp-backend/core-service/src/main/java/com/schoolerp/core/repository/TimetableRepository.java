package com.schoolerp.core.repository;

import com.schoolerp.core.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableRepository extends JpaRepository<TimetableEntry, String> {
    List<TimetableEntry> findByClassIdOrderByDayAscPeriodAsc(String classId);
    @org.springframework.transaction.annotation.Transactional
    void deleteByDay(String day);
    @org.springframework.transaction.annotation.Transactional
    void deleteByPeriod(int period);

    boolean existsByDay(String day);
    boolean existsByPeriod(int period);
}
