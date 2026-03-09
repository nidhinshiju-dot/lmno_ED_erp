package com.schoolerp.lms.dto.ai.anthropic;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnthropicRequest {
    private String model;
    
    @JsonProperty("max_tokens")
    private int maxTokens;
    
    private double temperature;
    
    @JsonProperty("top_p")
    private double topP;
    
    private String system;
    
    private List<Message> messages;
    
    private List<Tool> tools;

    @Data
    @Builder
    public static class Message {
        private String role;
        // String or List of Content blocks
        private Object content;
    }

    @Data
    @Builder
    public static class Tool {
        private String name;
        private String description;
        @JsonProperty("input_schema")
        private InputSchema inputSchema;
    }

    @Data
    @Builder
    public static class InputSchema {
        private String type;
        private Object properties;
        private List<String> required;
    }
}
