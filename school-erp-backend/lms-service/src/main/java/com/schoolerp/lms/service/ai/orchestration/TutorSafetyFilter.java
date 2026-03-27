package com.schoolerp.lms.service.ai.orchestration;

import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Component
public class TutorSafetyFilter {

    public void validateSafeInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prompt cannot be empty.");
        }
        
        String lowerInput = input.toLowerCase();
        if (lowerInput.contains("ignore all previous instructions") || lowerInput.contains("system prompt")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsafe instruction detected.");
        }
    }

    public String sanitizeOutput(String output) {
        if (output == null) return "System Error.";
        
        String cleaned = output.trim();
        // Fallback for LLMs injecting markdown wrappers aggressively despite prompt constraints
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring("```json".length());
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring("```".length());
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
        }
        
        return cleaned.trim();
    }
}
