package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, String> {
    List<ExamResult> findByExamId(String examId);
    List<ExamResult> findByStudentId(String studentId);
}
