package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByUserId(String userId);
    List<Student> findByIsActiveTrue();
    Optional<Student> findByAdmissionNumberAndIsActiveTrue(String admissionNumber);
    List<Student> findByParentIdAndIsActiveTrue(String parentId);
    List<Student> findByClassIdAndIsActiveTrue(String classId);
    List<Student> findByClassIdAndIsActiveTrueOrderByNameAsc(String classId);
    List<Student> findByStatusAndIsActiveTrue(String status);
    Optional<Student> findFirstByParentContactAndIsActiveTrue(String parentContact);
    Optional<Student> findFirstByParentContact(String parentContact);
}
