package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiTutorSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AiTutorSessionRepository extends JpaRepository<AiTutorSession, String> {
    Page<AiTutorSession> findByTenantIdAndTutorIdOrderBySessionStartDesc(String tenantId, String tutorId, Pageable pageable);
    Optional<AiTutorSession> findByIdAndTenantIdAndTutorId(String id, String tenantId, String tutorId);
}
