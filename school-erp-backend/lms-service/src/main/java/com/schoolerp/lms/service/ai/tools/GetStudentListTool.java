package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.entity.ai.AiStudent;
import com.schoolerp.lms.repository.ai.AiStudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetStudentListTool implements AiTool {

    private final AiStudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("get_student_list")
                .description("Retrieves the list of students for the current school. Does not require any parameters.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of()) // No parameters needed
                        .required(List.of())
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        log.info("Executing get_student_list tool");
        List<AiStudent> students = studentRepository.findAll();
        try {
            return objectMapper.writeValueAsString(students);
        } catch (Exception e) {
            log.error("Error serializing students", e);
            return "{\"error\": \"Failed to retrieve student list.\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        // Super Admin, Admin, and Teacher can see student lists. Students cannot.
        return List.of("SUPER_ADMIN", "ADMIN", "TEACHER").contains(role.toUpperCase());
    }
}
