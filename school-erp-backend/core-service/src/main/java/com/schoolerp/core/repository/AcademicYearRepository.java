package com.schoolerp.core.repository;

import com.schoolerp.core.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, String> {
    Optional<AcademicYear> findByIsCurrentTrue();
    java.util.List<AcademicYear> findByActiveTrueOrderByStartDateDesc();
}
