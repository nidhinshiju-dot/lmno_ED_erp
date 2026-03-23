package com.schoolerp.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/whatsapp")
@Slf4j
public class WhatsappWebhookController {

    // Usually fetched from DB or ENV. For demo: static.
    private static final String VERIFY_TOKEN = "school_erp_token"; 

    /**
     * Required by Meta to verify the webhook URL. 
     * Handled via GET request.
     */
    @GetMapping("/webhook")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge) {
        
        if ("subscribe".equals(mode) && VERIFY_TOKEN.equals(token)) {
            log.info("WEBHOOK_VERIFIED");
            return ResponseEntity.status(HttpStatus.OK).body(challenge);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Receives message delivery statuses (sent/delivered/read/failed)
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> receiveMessageStatus(@RequestBody Map<String, Object> payload) {
        log.info("Received WhatsApp Webhook Payload: {}", payload);
        
        // In a real scenario, you parse `entry[0].changes[0].value.statuses` 
        // Then update the `MessageLog` entity matching the `message_id`.

        // Return 200 OK immediately so Meta stops retrying
        return ResponseEntity.status(HttpStatus.OK).body("EVENT_RECEIVED");
    }
}
