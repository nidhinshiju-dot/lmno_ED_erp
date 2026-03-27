package com.schoolerp.lms.client;

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
import java.util.Collections;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExamClient {

    private final RestTemplate restTemplate;

    @Value("${services.core.url:http://localhost:8081}")
    private String coreServiceUrl;

    @Value("${internal.auth.secret:backend-internal-trust-key}")
    private String internalAuthSecret;

    public List<Map<String, Object>> getStudentExamHistory(String tenantId, String studentId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Auth", internalAuthSecret);
        headers.set("X-Tenant-ID", tenantId);

        try {
            // Replicating GetExamResultsTool proxy route
            String url = coreServiceUrl + "/api/v1/internal/exams/student/" + studentId + "/history";
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), List.class);
            if (response.getBody() != null) {
                return (List<Map<String, Object>>) response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch exam history for student {} in tenant {}. Proceeding safely.", studentId, tenantId);
        }
        return Collections.emptyList(); // Safe missing fallback
    }
}
