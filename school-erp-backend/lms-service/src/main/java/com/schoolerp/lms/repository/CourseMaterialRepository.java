package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, String> {
    List<CourseMaterial> findByTenantIdAndCourseIdAndStatusOrderByCreatedAtDesc(String tenantId, String courseId, String status);
    Optional<CourseMaterial> findByIdAndTenantIdAndCourseId(String id, String tenantId, String courseId);
}
