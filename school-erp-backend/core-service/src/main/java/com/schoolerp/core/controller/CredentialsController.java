package com.schoolerp.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.schoolerp.core.service.CredentialsService;
import com.schoolerp.core.service.WhatsappSenderService;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/credentials")
@RequiredArgsConstructor
public class CredentialsController {

    private final CredentialsService credentialsService;
    private final WhatsappSenderService whatsappSenderService;

    @GetMapping("/{type}")
    public ResponseEntity<java.util.List<com.schoolerp.core.dto.CredentialDto>> getCredentials(@PathVariable("type") String type) {
        return ResponseEntity.ok(credentialsService.getCredentials(type));
    }

    // Default monolithic School UUID for single-tenant mode
    private final UUID DEFAULT_SCHOOL_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    @PostMapping("/send-bulk")
    public ResponseEntity<Map<String, String>> sendBulkWhatsappCredentials(@RequestBody Map<String, Object> payload) {
        
        String type = (String) payload.get("type"); // "teachers", "students", "parents"
        java.util.List<String> selectedIds = (java.util.List<String>) payload.get("ids");
        
        if (type == null || selectedIds == null || selectedIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid payload array"));
        }

        java.util.List<com.schoolerp.core.dto.CredentialDto> credentials = credentialsService.getCredentials(type);
        int sentCount = 0;
        
        for (com.schoolerp.core.dto.CredentialDto cred : credentials) {
            if (selectedIds.contains(cred.getId().toString()) && cred.getContact() != null) {
                String cleanPhone = cred.getContact().replaceAll("[^0-9]", "");
                if (cleanPhone.length() >= 7 && cred.getUsername() != null && !cred.getUsername().isEmpty()) {
                    
                    String resetLink = "http://localhost:3000/reset-password?token=";
                    
                    try {
                        // Generate reset token
                        java.util.Map<String, String> reqBody = Map.of("email", cred.getUsername());
                        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                        headers.set("Content-Type", "application/json");
                        org.springframework.http.HttpEntity<Map<String, String>> request = new org.springframework.http.HttpEntity<>(reqBody, headers);
                        
                        ResponseEntity<Map> response = restTemplate.postForEntity("http://erp-uat-auth:8081/api/v1/auth/generate-reset-token", request, Map.class);
                        if (response.getBody() != null && response.getBody().containsKey("token")) {
                            resetLink += response.getBody().get("token");
                        } else {
                            continue; // Skip if token generation failed
                        }
                    } catch (Exception e) {
                        continue; // Skip if auth-service fetch failed
                    }
                    
                    // Dispatch via SenderService
                    whatsappSenderService.sendCredentialTemplate(
                        DEFAULT_SCHOOL_ID, 
                        cleanPhone, 
                        cred.getName(), 
                        cred.getUsername(), 
                        resetLink
                    );
                    sentCount++;
                }
            }
        }

        return ResponseEntity.ok(Map.of("message", "Successfully dispatched " + sentCount + " WhatsApp Credentials"));
    }
}
