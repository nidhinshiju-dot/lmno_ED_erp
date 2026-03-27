package com.schoolerp.lms.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorPreferenceDto {
    private String id;
    private String tutorId;
    private String explanationStyle;
    private String answerLength;
    private Boolean preferExamples;
    private Boolean preferFormulas;
    private Boolean preferTheory;
    private String goalType;
}
