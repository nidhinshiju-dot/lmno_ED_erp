package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByCourseIdOrderByOrderIndexAsc(String courseId);
    List<Lesson> findByModuleIdOrderByOrderIndexAsc(String moduleId);
}
