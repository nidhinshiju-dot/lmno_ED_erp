package com.schoolerp.core.repository;

import com.schoolerp.core.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, String> {
    List<SchoolClass> findByAcademicYearOrderByNameAsc(String academicYear);
    Optional<SchoolClass> findByClassTeacherId(String classTeacherId);
}
