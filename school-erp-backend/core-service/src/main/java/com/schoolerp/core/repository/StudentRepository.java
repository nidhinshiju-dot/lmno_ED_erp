package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);
    List<Student> findByParentId(String parentId);
    List<Student> findBySectionId(String sectionId);
    List<Student> findByClassId(String classId);
    List<Student> findByStatus(String status);
}
