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
public class AiTutorInsightDto {
    private String id;
    private String tutorId;
    private String courseId;
    private String insightType;
    private String topicKey;
    private String topicLabel;
    private Double score;
    private Double confidence;
    private LocalDateTime generatedAt;
}
