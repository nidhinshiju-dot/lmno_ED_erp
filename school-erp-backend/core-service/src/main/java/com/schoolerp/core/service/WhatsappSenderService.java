package com.schoolerp.core.service;

import com.schoolerp.core.entity.WhatsappConfig;
import com.schoolerp.core.entity.MessageLog;
import com.schoolerp.core.repository.WhatsappConfigRepository;
import com.schoolerp.core.repository.MessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.UUID;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsappSenderService {

    private final WhatsappConfigRepository whatsappConfigRepository;
    private final MessageLogRepository messageLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String META_GRAPH_URL = "https://graph.facebook.com/v19.0/";

    public void sendCredentialTemplate(UUID schoolId, String recipientPhone, String name, String username, String password) {
        
        WhatsappConfig config = whatsappConfigRepository.findBySchoolId(schoolId)
            .orElseThrow(() -> new RuntimeException("WhatsApp configuration not found for school."));

        if (!Boolean.TRUE.equals(config.getEnabled())) {
            log.warn("WhatsApp integration is disabled for school {}", schoolId);
            return;
        }

        String url = META_GRAPH_URL + config.getPhoneNumberId() + "/messages";

        // Construct Meta JSON Payload for Template `erp_credentials`
        Map<String, Object> payload = Map.of(
            "messaging_product", "whatsapp",
            "to", recipientPhone,
            "type", "template",
            "template", Map.of(
                "name", "erp_credentials",
                "language", Map.of("code", "en_US"),
                "components", List.of(
                    Map.of(
                        "type", "body",
                        "parameters", List.of(
                            Map.of("type", "text", "text", name),
                            Map.of("type", "text", "text", username),
                            Map.of("type", "text", "text", password)
                        )
                    )
                )
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(config.getAccessToken());
        headers.set("Content-Type", "application/json");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Map<String, Object> body = response.getBody();
            
            // Extract Meta's specialized Message ID
            if (body != null && body.containsKey("messages")) {
                List<Map<String, String>> msgs = (List<Map<String, String>>) body.get("messages");
                String messageId = msgs.get(0).get("id");
                
                // Construct Audit Trail
                MessageLog logEntry = new MessageLog();
                logEntry.setMessageId(messageId);
                logEntry.setRecipientPhone(recipientPhone);
                logEntry.setStatus("sent"); // Awaiting webhook for 'delivered'
                logEntry.setTemplateName("erp_credentials");
                messageLogRepository.save(logEntry);
            }

        } catch (Exception e) {
            log.error("Failed to send WhatsApp Template message to {}", recipientPhone, e);
            MessageLog errLog = new MessageLog();
            errLog.setMessageId(UUID.randomUUID().toString() + "_FAILED");
            errLog.setRecipientPhone(recipientPhone);
            errLog.setStatus("failed");
            errLog.setTemplateName("erp_credentials");
            errLog.setErrorDetails(e.getMessage());
            messageLogRepository.save(errLog);
        }
    }
}
