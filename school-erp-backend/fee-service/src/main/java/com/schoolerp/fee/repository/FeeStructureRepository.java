package com.schoolerp.fee.repository;

import com.schoolerp.fee.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, String> {
    List<FeeStructure> findByAcademicYear(String academicYear);
    List<FeeStructure> findByClassId(String classId);
}
