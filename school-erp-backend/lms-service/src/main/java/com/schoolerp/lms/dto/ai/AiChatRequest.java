package com.schoolerp.lms.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {
    private String query;
    private String userRole; // SUPER_ADMIN, ADMIN, TEACHER, STUDENT
    private String subject; // Optional, utilized mainly by STUDENT
}
