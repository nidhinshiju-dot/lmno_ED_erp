package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.QuestionPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionPaperRepository extends JpaRepository<QuestionPaper, String> {
    List<QuestionPaper> findByExamId(String examId);
    List<QuestionPaper> findByTeacherId(String teacherId);
    List<QuestionPaper> findByStatus(String status);
}
