package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiTutorInsight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiTutorInsightRepository extends JpaRepository<AiTutorInsight, String> {
    List<AiTutorInsight> findByTenantIdAndTutorIdAndStudentId(String tenantId, String tutorId, String studentId);
    void deleteByTenantIdAndTutorIdAndStudentId(String tenantId, String tutorId, String studentId);
}
