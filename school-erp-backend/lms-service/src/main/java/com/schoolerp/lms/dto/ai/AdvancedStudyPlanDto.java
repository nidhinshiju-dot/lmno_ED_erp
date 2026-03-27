package com.schoolerp.lms.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdvancedStudyPlanDto {
    private String tutorId;
    private String focusGoal;
    private List<Map<String, String>> contextualModules;
    private List<ExamPlanDto.PlanItem> tailoredSchedule;
}
