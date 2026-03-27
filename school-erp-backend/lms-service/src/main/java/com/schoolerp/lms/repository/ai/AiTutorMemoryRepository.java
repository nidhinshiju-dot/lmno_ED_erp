package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiTutorMemory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiTutorMemoryRepository extends JpaRepository<AiTutorMemory, String> {
    List<AiTutorMemory> findByTenantIdAndTutorIdAndStudentIdOrderByImportanceDesc(String tenantId, String tutorId, String studentId);
    void deleteByTenantIdAndTutorIdAndStudentId(String tenantId, String tutorId, String studentId);
}
