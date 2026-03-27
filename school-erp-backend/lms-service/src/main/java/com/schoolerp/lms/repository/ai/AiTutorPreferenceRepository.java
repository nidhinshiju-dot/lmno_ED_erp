package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiTutorPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiTutorPreferenceRepository extends JpaRepository<AiTutorPreference, String> {
    Optional<AiTutorPreference> findByTenantIdAndTutorIdAndStudentId(String tenantId, String tutorId, String studentId);
}
