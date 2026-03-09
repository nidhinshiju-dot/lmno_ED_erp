package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.entity.ai.PlatformAnalytics;
import com.schoolerp.lms.repository.ai.PlatformAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetPlatformAnalyticsTool implements AiTool {

    private final PlatformAnalyticsRepository analyticsRepository;
    private final ObjectMapper objectMapper;

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("get_platform_analytics")
                .description("Retrieves global, cross-tenant aggregated analytics. ONLY allowed for Super Admin users.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of())
                        .required(List.of())
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        log.info("Executing get_platform_analytics tool");
        List<PlatformAnalytics> metrics = analyticsRepository.findRecentAnalytics();
        
        try {
            return objectMapper.writeValueAsString(metrics);
        } catch (Exception e) {
            log.error("Error serializing platform analytics", e);
            return "{\"error\": \"Failed to retrieve analytics.\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        // Strict enforcement: Only SUPER_ADMIN can hit cross-tenant aggregated analytics
        return "SUPER_ADMIN".equalsIgnoreCase(role);
    }
}
