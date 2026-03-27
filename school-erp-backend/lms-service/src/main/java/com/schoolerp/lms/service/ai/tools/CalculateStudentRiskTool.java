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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CalculateStudentRiskTool implements AiTool {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.core.url:http://localhost:8081}")
    private String coreServiceUrl;

    @Value("${services.fee.url:http://localhost:8083}")
    private String feeServiceUrl;

    @Value("${internal.auth.secret:backend-internal-trust-key}")
    private String internalAuthSecret;

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("calculate_student_risk")
                .description("Calculates the academic and operational risk score for a given student ID dynamically via proxy integrations.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of(
                                "studentId", Map.of("type", "string", "description", "ID of the student to calculate risk for.")
                        ))
                        .required(List.of("studentId"))
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        String studentId = (String) input.get("studentId");
        if (studentId == null || studentId.isEmpty()) {
            return "{\"error\": \"studentId is required\"}";
        }

        log.info("Calculating risk proxying downstream for student: {}", studentId);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Auth", internalAuthSecret);

        Map<String, Object> combinedRisk = new HashMap<>();
        combinedRisk.put("studentId", studentId);

        try {
            // 1. Fetch Academic Risk DTO
            ResponseEntity<Map> academicResponse = restTemplate.exchange(
                    coreServiceUrl + "/api/v1/internal/students/" + studentId + "/risk/academic",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );
            if (academicResponse.getBody() != null) {
                combinedRisk.putAll(academicResponse.getBody());
            }

            // 2. Fetch Financial Risk DTO
            ResponseEntity<Map> feeResponse = restTemplate.exchange(
                    feeServiceUrl + "/api/v1/internal/invoices/student/" + studentId + "/risk/financial",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );
            if (feeResponse.getBody() != null) {
                combinedRisk.putAll(feeResponse.getBody());
            }

            // Combine composite risk
            double attScore = extractDouble(combinedRisk.get("attendanceDropScore"));
            double examScore = extractDouble(combinedRisk.get("examsScoreDrop"));
            double feeScore = extractDouble(combinedRisk.get("feeRiskScore"));

            double totalRiskScore = (attScore * 0.4) + (examScore * 0.4) + (feeScore * 0.2);
            combinedRisk.put("riskScore", totalRiskScore);
            
            String riskCategory = "Low";
            if (totalRiskScore > 30 && totalRiskScore <= 60) riskCategory = "Medium";
            else if (totalRiskScore > 60) riskCategory = "High";
            
            combinedRisk.put("riskCategory", riskCategory);

            return objectMapper.writeValueAsString(combinedRisk);
        } catch (Exception e) {
            log.error("Internal service timeout or failure calculating risk", e);
            return "{\"error\": \"Proxy failure determining student risk factor across dependent services\"}";
        }
    }

    private double extractDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        return 0.0;
    }

    @Override
    public boolean isAllowedForRole(String role) {
        return List.of("SUPER_ADMIN", "ADMIN", "TEACHER").contains(role.toUpperCase());
    }
}
