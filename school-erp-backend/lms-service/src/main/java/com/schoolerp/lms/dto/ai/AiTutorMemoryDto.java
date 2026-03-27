package com.schoolerp.lms.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorMemoryDto {
    private String id;
    private String tutorId;
    private String memoryType;
    private String memoryKey;
    private String memoryValueJson;
    private Integer importance;
    private LocalDateTime lastUsedAt;
    private LocalDateTime updatedAt;
}
