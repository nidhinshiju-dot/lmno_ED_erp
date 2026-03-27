package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByTeacherId(String teacherId);

    @Query("SELECT new com.schoolerp.lms.dto.SyllabusStatusResponse(" +
           "c.id, c.title, c.teacherId, c.classId, " +
           "CASE WHEN s.id IS NOT NULL THEN 'UPLOADED' ELSE 'PENDING' END, " +
           "s.version, s.uploadedByUserId, s.updatedAt) " +
           "FROM Course c LEFT JOIN Syllabus s ON c.id = s.courseId AND s.tenantId = :tenantId " +
           "WHERE c.tenantId = :tenantId AND (s.version IS NULL OR s.version = (SELECT MAX(s2.version) FROM Syllabus s2 WHERE s2.courseId = c.id AND s2.tenantId = :tenantId))")
    List<com.schoolerp.lms.dto.SyllabusStatusResponse> getAdminSyllabusStatus(@org.springframework.data.repository.query.Param("tenantId") String tenantId);
}
