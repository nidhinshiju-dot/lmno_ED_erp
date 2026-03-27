package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, String> {

    @Query("SELECT l.modelUsed, l.endpoint, l.latencyMs, l.promptTokens, l.completionTokens, l.status, l.cacheHit, l.modelRequested, l.cacheWriteTokens, l.cacheReadTokens " +
           "FROM AiUsageLog l WHERE l.tenantId = :tenantId " +
           "ORDER BY l.createdAt DESC")
    List<Object[]> findTelemetryAggregates(@Param("tenantId") String tenantId);
}
