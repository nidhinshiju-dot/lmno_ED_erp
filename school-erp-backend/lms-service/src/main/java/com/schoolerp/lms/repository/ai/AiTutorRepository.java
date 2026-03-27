package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiTutor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiTutorRepository extends JpaRepository<AiTutor, String> {
    List<AiTutor> findByTenantIdAndStudentId(String tenantId, String studentId);
    Optional<AiTutor> findByIdAndTenantIdAndStudentId(String id, String tenantId, String studentId);
    long countByTenantIdAndStudentIdAndStatus(String tenantId, String studentId, String status);
}
