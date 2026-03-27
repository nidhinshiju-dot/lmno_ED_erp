package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SyllabusRepository extends JpaRepository<Syllabus, String> {
    List<Syllabus> findByTenantIdAndStatus(String tenantId, String status);
    
    Optional<Syllabus> findTopByTenantIdAndCourseIdOrderByVersionDesc(String tenantId, String courseId);
    List<Syllabus> findByTenantIdAndCourseIdOrderByVersionDesc(String tenantId, String courseId);
}
