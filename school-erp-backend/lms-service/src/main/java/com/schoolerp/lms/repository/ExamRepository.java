package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
    List<Exam> findByClassId(String classId);
    List<Exam> findByTeacherId(String teacherId);
    List<Exam> findBySubjectId(String subjectId);
}
