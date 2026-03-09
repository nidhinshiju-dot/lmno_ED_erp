package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.entity.ai.AiExamResult;
import com.schoolerp.lms.repository.ai.AiExamResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetExamResultsTool implements AiTool {

    private final AiExamResultRepository examResultRepository;
    private final ObjectMapper objectMapper;

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("get_exam_results")
                .description("Retrieves the exam results. Can optionally filter by student ID.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of(
                                "studentId", Map.of("type", "string", "description", "Optional. ID of the student to fetch exam results for.")
                        ))
                        .required(List.of())
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        log.info("Executing get_exam_results tool with input: {}", input);
        
        String studentId = (String) input.get("studentId");
        List<AiExamResult> results;
        
        if (studentId != null && !studentId.isEmpty()) {
            results = examResultRepository.findByStudentId(studentId);
        } else {
            results = examResultRepository.findAll();
        }

        try {
            return objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            log.error("Error serializing exam results", e);
            return "{\"error\": \"Failed to retrieve exam results.\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        // All roles can see exam results (Student can see their own but that's a UI/Session filter layer)
        return true; 
    }
}
