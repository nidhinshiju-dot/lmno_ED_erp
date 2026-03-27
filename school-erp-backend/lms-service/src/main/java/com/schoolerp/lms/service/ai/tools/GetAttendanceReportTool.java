package com.schoolerp.lms.service.ai.tools;

import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GetAttendanceReportTool implements AiTool {

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("get_attendance_report")
                .description("Retrieves attendance records for a specific class or student.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of(
                                "studentId", Map.of("type", "string", "description", "Optional. ID of the student to fetch attendance for."),
                                "classId", Map.of("type", "string", "description", "Optional. ID of the class to fetch attendance for.")
                        ))
                        .required(List.of())
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        log.info("Executing get_attendance_report tool with input: {}", input);
        // Stubbed since AiAttendanceRepository is unavailable.
        return "{\"error\": \"Attendance data mapping is temporarily unavailable.\"}";
    }

    @Override
    public boolean isAllowedForRole(String role) {
        return List.of("SUPER_ADMIN", "ADMIN", "TEACHER").contains(role.toUpperCase());
    }
}
