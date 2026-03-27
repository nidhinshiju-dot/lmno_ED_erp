package com.schoolerp.lms.dto.ai;

import dev.langchain4j.model.output.Response;
import dev.langchain4j.data.message.AiMessage;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class AnthropicResponseDto {
    private Response<AiMessage> response;
    private long latencyMs;
    private String modelRequested;
    private String modelUsed;
    private String status;
    private String errorCode;
    private boolean cacheHit;
    private boolean structuredJsonValid;
}
