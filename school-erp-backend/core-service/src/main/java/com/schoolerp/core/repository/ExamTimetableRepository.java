package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ExamTimetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamTimetableRepository extends JpaRepository<ExamTimetable, String> {
    List<ExamTimetable> findByClassId(String classId);
    List<ExamTimetable> findByExamId(String examId);
}
