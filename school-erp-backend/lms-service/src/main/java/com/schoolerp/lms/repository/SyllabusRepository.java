package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusRepository extends JpaRepository<Syllabus, String> {
    List<Syllabus> findByTeacherId(String teacherId);
    List<Syllabus> findByClassSubjectTeacherId(String classSubjectTeacherId);
    List<Syllabus> findByGradeLevel(Integer gradeLevel);
    List<Syllabus> findByStatus(String status);
}
