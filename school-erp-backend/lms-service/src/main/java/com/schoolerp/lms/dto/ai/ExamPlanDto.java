package com.schoolerp.lms.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamPlanDto {
    private String tutorId;
    private String courseId;
    private String studentId;
    private List<PlanItem> schedule;
    private LocalDateTime generatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanItem {
        private String dayOffset;
        private String topic;
        private String activity;
        private String priority;
    }
}
