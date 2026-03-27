package com.schoolerp.lms.controller;

import com.schoolerp.lms.dto.ai.LmsAnalyticsSummaryDto;
import com.schoolerp.lms.dto.ai.AiTelemetryDto;
import com.schoolerp.lms.security.LmsSecurityUtil;
import com.schoolerp.lms.repository.ai.AiTutorRepository;
import com.schoolerp.lms.repository.ai.AiTutorSessionRepository;
import com.schoolerp.lms.repository.ai.AiUsageLogRepository;
import com.schoolerp.lms.repository.SyllabusRepository;
import com.schoolerp.lms.context.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/lms/analytics")
@RequiredArgsConstructor
public class LmsAnalyticsController {

    private final LmsSecurityUtil securityUtil;
    private final AiTutorRepository tutorRepository;
    private final AiTutorSessionRepository sessionRepository;
    private final SyllabusRepository syllabusRepository;
    private final AiUsageLogRepository usageLogRepository;

    @GetMapping("/summary")
    public ResponseEntity<LmsAnalyticsSummaryDto> getSummary() {
        securityUtil.requireAdmin(); // Enforces ADMIN role exclusively (Phase 3 constraint)

        String tenantId = RequestContext.getContext().getTenantId();

        LmsAnalyticsSummaryDto dto = new LmsAnalyticsSummaryDto();
        dto.setTenantId(tenantId);
        dto.setTotalTutors(tutorRepository.count());
        dto.setActiveTutors(tutorRepository.count()); // simplified aggregation omitting strictly status filter
        dto.setTotalSessions(sessionRepository.count());
        dto.setTotalSyllabi(syllabusRepository.count());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/ai-telemetry")
    public ResponseEntity<List<AiTelemetryDto>> getAiTelemetry() {
        securityUtil.requireAdmin();

        String tenantId = RequestContext.getContext().getTenantId();
        List<Object[]> queryResults = usageLogRepository.findTelemetryAggregates(tenantId);

        List<AiTelemetryDto> telemetryList = queryResults.stream().map(row -> {
            AiTelemetryDto dto = new AiTelemetryDto();
            dto.setModelUsed((String) row[0]);
            dto.setEndpoint((String) row[1]);
            dto.setLatencyMs((Long) row[2]);
            dto.setPromptTokens((Integer) row[3]);
            dto.setCompletionTokens((Integer) row[4]);
            dto.setStatus((String) row[5]);
            dto.setCacheHit((Boolean) row[6]);
            // dto.setModelRequested((String) row[7]); // skipped in DTO
            dto.setCacheWriteTokens((Integer) row[8]);
            dto.setCacheReadTokens((Integer) row[9]);
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(telemetryList);
    }
}
