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

import java.util.Map;
import java.util.HashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceClient {

    private final RestTemplate restTemplate;

    @Value("${services.core.url:http://localhost:8081}")
    private String coreServiceUrl;

    @Value("${internal.auth.secret:backend-internal-trust-key}")
    private String internalAuthSecret;

    public Map<String, Object> getStudentAttendanceStats(String tenantId, String studentId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Auth", internalAuthSecret);
        headers.set("X-Tenant-ID", tenantId);

        try {
            // Using existing risk academic proxy which brings attendance drops, or fallback map.
            String url = coreServiceUrl + "/api/v1/internal/students/" + studentId + "/risk/academic";
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch attendance stats for student {} in tenant {}. Proceeding safely.", studentId, tenantId);
        }
        return new HashMap<>(); // Explicit fallback map to handle missing services gracefully
    }
}
