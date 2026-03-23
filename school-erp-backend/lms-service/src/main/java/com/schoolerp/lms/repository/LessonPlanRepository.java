package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.LessonPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonPlanRepository extends JpaRepository<LessonPlan, String> {
    List<LessonPlan> findByTeacherId(String teacherId);
    List<LessonPlan> findByClassSubjectTeacherId(String classSubjectTeacherId);
    List<LessonPlan> findByGradeLevel(Integer gradeLevel);
    List<LessonPlan> findByStatus(String status);
}
