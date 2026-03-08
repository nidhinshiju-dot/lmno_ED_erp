package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseModuleRepository extends JpaRepository<CourseModule, String> {
    List<CourseModule> findByCourseIdOrderByOrderIndexAsc(String courseId);
}
