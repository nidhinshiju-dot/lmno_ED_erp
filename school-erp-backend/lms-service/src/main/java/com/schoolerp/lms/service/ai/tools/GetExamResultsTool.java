package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetExamResultsTool implements AiTool {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.core.url:http://localhost:8081}")
    private String coreServiceUrl;

    @Value("${internal.auth.secret:backend-internal-trust-key}")
    private String internalAuthSecret;

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("get_exam_results")
                .description("Retrieves the exam results natively from core-service proxy.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of(
                                "studentId", Map.of("type", "string", "description", "ID of the student to fetch exam results for.")
                        ))
                        .required(List.of("studentId"))
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        log.info("Executing get_exam_results tool with proxy context: {}", input);
        
        String studentId = (String) input.get("studentId");
        if (studentId == null || studentId.isEmpty()) {
            return "{\"error\": \"studentId is mandatory for internal isolation.\"}";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Auth", internalAuthSecret);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    coreServiceUrl + "/api/v1/internal/exams/student/" + studentId + "/history",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Error proxying to core-service for exam results", e);
            return "{\"error\": \"Failed to retrieve exam results due to upstream failure.\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        return true; 
    }
}
