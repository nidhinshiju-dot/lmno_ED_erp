package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiExamResultRepository extends JpaRepository<AiExamResult, String> {

    List<AiExamResult> findByStudentId(String studentId);
    
    // Support risk tool
    @Query("SELECT r FROM AiExamResult r WHERE r.studentId = :studentId ORDER BY r.id DESC")
    List<AiExamResult> findRecentResultsByStudentId(@Param("studentId") String studentId);
    
    // Cross-tenant analytics query
    @Query(value = "SELECT AVG(marks_obtained) FROM exam_results WHERE subject_id = :subjectId", nativeQuery = true)
    Double getAverageScoreBySubjectCrossTenant(@Param("subjectId") String subjectId);
}
