package com.schoolerp.core.controller;

import com.schoolerp.core.entity.WhatsappConfig;
import com.schoolerp.core.repository.WhatsappConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.UUID;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/whatsapp/config")
@RequiredArgsConstructor
@Slf4j
public class WhatsappConfigController {

    private final WhatsappConfigRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();

    // Default monolithic School UUID for single-tenant mode
    private final UUID DEFAULT_SCHOOL_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @GetMapping
    public ResponseEntity<WhatsappConfig> getConfig() {
        Optional<WhatsappConfig> config = repository.findBySchoolId(DEFAULT_SCHOOL_ID);
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<WhatsappConfig> saveConfig(@RequestBody WhatsappConfig config) {
        config.setSchoolId(DEFAULT_SCHOOL_ID);
        
        Optional<WhatsappConfig> existing = repository.findBySchoolId(DEFAULT_SCHOOL_ID);
        if (existing.isPresent()) {
            WhatsappConfig e = existing.get();
            e.setPhoneNumberId(config.getPhoneNumberId());
            e.setBusinessAccountId(config.getBusinessAccountId());
            e.setAccessToken(config.getAccessToken());
            e.setWebhookToken(config.getWebhookToken());
            e.setEnabled(config.getEnabled());
            return ResponseEntity.ok(repository.save(e));
        } else {
            return ResponseEntity.ok(repository.save(config));
        }
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection(@RequestBody WhatsappConfig config) {
        try {
            String url = "https://graph.facebook.com/v19.0/" + config.getPhoneNumberId();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(config.getAccessToken());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "Connection Verified"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Test failed"));
            }
        } catch (HttpClientErrorException e) {
            log.error("Meta Graph API Ping Failed: {}", e.getResponseBodyAsString());
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Authentication Failed. Ensure Token & Phone ID are valid."));
        } catch (Exception e) {
            log.error("Server exception during Meta ping", e);
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
