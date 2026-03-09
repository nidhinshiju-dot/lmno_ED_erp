package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TimetableHeaderRepository extends JpaRepository<Timetable, String> {
    List<Timetable> findAllByOrderByCreatedAtDesc();

    List<Timetable> findByAcademicYear(String academicYear);

    Optional<Timetable> findByAcademicYearAndTermAndStatus(String academicYear, String term, String status);
}
