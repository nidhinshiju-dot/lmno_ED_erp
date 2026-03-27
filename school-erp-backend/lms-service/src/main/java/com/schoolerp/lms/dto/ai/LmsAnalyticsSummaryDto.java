package com.schoolerp.lms.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LmsAnalyticsSummaryDto {
    private String tenantId;
    private long totalTutors;
    private long activeTutors;
    private long totalSessions;
    private long totalSyllabi;
}
