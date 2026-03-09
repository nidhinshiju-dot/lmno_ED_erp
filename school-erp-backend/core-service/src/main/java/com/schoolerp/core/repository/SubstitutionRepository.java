package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Substitution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SubstitutionRepository extends JpaRepository<Substitution, String> {
    List<Substitution> findByDate(LocalDate date);

    List<Substitution> findByDateAndClassId(LocalDate date, String classId);

    List<Substitution> findByOriginalTeacherIdAndDate(String originalTeacherId, LocalDate date);

    List<Substitution> findByDateBetween(LocalDate from, LocalDate to);
}
