package com.schoolerp.lms.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiTelemetryDto {
    private String modelUsed;
    private String endpoint;
    private Long latencyMs;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer cacheWriteTokens;
    private Integer cacheReadTokens;
    private String status;
    private Boolean cacheHit;
}
