package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiTutorMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AiTutorMessageRepository extends JpaRepository<AiTutorMessage, String> {
    Page<AiTutorMessage> findByTenantIdAndSessionIdOrderByTimestampDesc(String tenantId, String sessionId, Pageable pageable);
}
