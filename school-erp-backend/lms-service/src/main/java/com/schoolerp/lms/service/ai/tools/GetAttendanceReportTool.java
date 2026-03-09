package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.entity.ai.AiAttendance;
import com.schoolerp.lms.repository.ai.AiAttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetAttendanceReportTool implements AiTool {

    private final AiAttendanceRepository attendanceRepository;
    private final ObjectMapper objectMapper;

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
        
        String studentId = (String) input.get("studentId");
        String classId = (String) input.get("classId");
        
        List<AiAttendance> records;
        
        if (studentId != null && !studentId.isEmpty()) {
            records = attendanceRepository.findByStudentId(studentId);
        } else if (classId != null && !classId.isEmpty()) {
            records = attendanceRepository.findByClassId(classId);
        } else {
            records = attendanceRepository.findAll();
        }

        try {
            return objectMapper.writeValueAsString(records);
        } catch (Exception e) {
            log.error("Error serializing attendance", e);
            return "{\"error\": \"Failed to retrieve attendance records.\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        return List.of("SUPER_ADMIN", "ADMIN", "TEACHER").contains(role.toUpperCase());
    }
}
