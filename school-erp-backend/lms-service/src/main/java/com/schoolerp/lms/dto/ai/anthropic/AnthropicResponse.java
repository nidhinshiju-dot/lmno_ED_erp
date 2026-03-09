package com.schoolerp.lms.dto.ai.anthropic;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AnthropicResponse {
    private String id;
    private String type;
    private String role;
    private List<Content> content;
    private String model;
    @JsonProperty("stop_reason")
    private String stopReason;
    @JsonProperty("stop_sequence")
    private String stopSequence;
    private Usage usage;

    @Data
    public static class Content {
        private String type;
        private String text;
        private String id;
        private String name;
        private Map<String, Object> input;
    }

    @Data
    public static class Usage {
        @JsonProperty("input_tokens")
        private int inputTokens;
        @JsonProperty("output_tokens")
        private int outputTokens;
    }
}
