package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.entity.ai.AiExamResult;
import com.schoolerp.lms.repository.ai.AiAttendanceRepository;
import com.schoolerp.lms.repository.ai.AiExamResultRepository;
import com.schoolerp.lms.repository.ai.AiInvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CalculateStudentRiskTool implements AiTool {

    private final AiAttendanceRepository attendanceRepository;
    private final AiExamResultRepository examResultRepository;
    private final AiInvoiceRepository invoiceRepository;
    private final ObjectMapper objectMapper;

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("calculate_student_risk")
                .description("Calculates the academic and operational risk score for a given student ID.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of(
                                "studentId", Map.of("type", "string", "description", "ID of the student to calculate risk for.")
                        ))
                        .required(List.of("studentId"))
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        String studentId = (String) input.get("studentId");
        if (studentId == null || studentId.isEmpty()) {
            return "{\"error\": \"studentId is required\"}";
        }

        log.info("Calculating risk for student: {}", studentId);

        // 1. Attendance Drop (0-100 scale, higher is worse attendance)
        long totalDays = attendanceRepository.countTotalAttendanceDaysByStudentId(studentId);
        long absences = attendanceRepository.countAbsencesByStudentId(studentId);
        
        double attendanceDropScore = 0.0;
        if (totalDays > 0) {
            double absentPercentage = ((double) absences / totalDays) * 100.0;
            // Scale: if absent 0%, score is 0. If absent 50%+, score is 100
            attendanceDropScore = Math.min(100.0, absentPercentage * 2); 
        }

        // 2. Score Drop (0-100 scale, derived from exam results)
        List<AiExamResult> recentExams = examResultRepository.findRecentResultsByStudentId(studentId);
        double scoreDropScore = 0.0;
        
        if (recentExams != null && !recentExams.isEmpty()) {
            // Very simplified: just checking if recent average is low
            double totalObtained = 0.0;
            double totalMax = 0.0;
            for (AiExamResult result : recentExams) {
                if (result.getMarksObtained() != null && result.getMaxMarks() != null) {
                    totalObtained += result.getMarksObtained().doubleValue();
                    totalMax += result.getMaxMarks().doubleValue();
                }
            }
            if (totalMax > 0.0) {
                double avgPercent = (totalObtained / totalMax) * 100.0;
                // If avg is 100%, scoreDropScore is 0. If avg is 40% (failing), scoreDropScore is 100.
                scoreDropScore = Math.max(0.0, 100.0 - ((avgPercent - 40.0) * (100.0 / 60.0)));
                scoreDropScore = Math.min(100.0, scoreDropScore);
            }
        }

        // 3. Fee Pending (0-100 scale)
        long pendingFeeCount = invoiceRepository.findByStudentIdAndStatus(studentId, "PENDING").size();
        long overdueFeeCount = invoiceRepository.findByStudentIdAndStatus(studentId, "OVERDUE").size();
        
        double feePendingScore = Math.min(100.0, (pendingFeeCount * 25.0) + (overdueFeeCount * 50.0));

        // Risk formula: (attendance_drop * 0.4) + (score_drop * 0.4) + (fee_pending * 0.2)
        double totalRiskScore = (attendanceDropScore * 0.4) + (scoreDropScore * 0.4) + (feePendingScore * 0.2);
        
        String riskCategory = "Low";
        if (totalRiskScore > 30 && totalRiskScore <= 60) {
            riskCategory = "Medium";
        } else if (totalRiskScore > 60) {
            riskCategory = "High";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("studentId", studentId);
        result.put("riskScore", BigDecimal.valueOf(totalRiskScore).setScale(2, RoundingMode.HALF_UP));
        result.put("riskCategory", riskCategory);
        result.put("attendanceDropFactor", BigDecimal.valueOf(attendanceDropScore).setScale(2, RoundingMode.HALF_UP));
        result.put("scoreDropFactor", BigDecimal.valueOf(scoreDropScore).setScale(2, RoundingMode.HALF_UP));
        result.put("feePendingFactor", BigDecimal.valueOf(feePendingScore).setScale(2, RoundingMode.HALF_UP));

        try {
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            log.error("Error serializing risk result", e);
            return "{\"error\": \"Failed to calculate risk\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        return List.of("SUPER_ADMIN", "ADMIN", "TEACHER").contains(role.toUpperCase());
    }
}
