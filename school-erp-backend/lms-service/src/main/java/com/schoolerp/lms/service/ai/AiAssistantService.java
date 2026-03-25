package com.schoolerp.lms.service.ai;

import com.schoolerp.lms.config.tenant.TenantContext;
import com.schoolerp.lms.dto.ai.AiChatRequest;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicResponse;
import com.schoolerp.lms.service.ai.anthropic.AnthropicService;
import com.schoolerp.lms.service.ai.tools.AiTool;
import com.schoolerp.lms.service.ai.rag.DocumentProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final AnthropicService anthropicService;
    private final AiToolRegistry toolRegistry;
    private final java.util.Optional<DocumentProcessorService> documentProcessorServiceOptional;

    private static final String MODEL_NAME = "claude-3-haiku-20240307";

    public String processQuery(AiChatRequest request) {
        String systemPrompt = getSystemPromptForRole(request.getUserRole(), request.getSubject());
        List<AnthropicRequest.Tool> allowedTools = toolRegistry.getToolsForRole(request.getUserRole());

        String finalSystemPrompt = systemPrompt;
        
        // If Student, attach RAG Context to System Prompt based on the course they are asking about
        // For prototype, assuming the query has some course context or we scan ALL their courses.
        // We will just fetch a generic context for now
        if ("STUDENT".equalsIgnoreCase(request.getUserRole()) && documentProcessorServiceOptional.isPresent()) {
             String context = documentProcessorServiceOptional.get().retrieveContextForQuery(request.getQuery(), "course-123");
             finalSystemPrompt += "\n\nUse the following course document context to answer the student's question:\n" + context;
        }

        double temperature = "STUDENT".equalsIgnoreCase(request.getUserRole()) ? 0.7 : 0.2;

        AnthropicRequest anthropicRequest = AnthropicRequest.builder()
                .model(MODEL_NAME)
                .maxTokens(4000)
                .temperature(temperature)
                .topP(0.9)
                .system(finalSystemPrompt)
                .tools(allowedTools)
                .messages(List.of(
                        AnthropicRequest.Message.builder()
                                .role("user")
                                .content(request.getQuery())
                                .build()
                ))
                .build();

        log.info("Sending request to Claude API for role: {} on tenant: {}", request.getUserRole(), TenantContext.getCurrentTenant());
        
        // Initial call
        AnthropicResponse response = anthropicService.callClaude(anthropicRequest);

        // Check if a tool was called
        if ("tool_use".equals(response.getStopReason())) {
             return handleToolUse(anthropicRequest, response, request.getUserRole());
        }

        return extractTextFromResponse(response);
    }

    private String handleToolUse(AnthropicRequest originalRequest, AnthropicResponse toolUseResponse, String userRole) {
        log.info("Claude decided to use a tool.");
        
        // Find the tool use content block
        AnthropicResponse.Content toolUseContent = toolUseResponse.getContent().stream()
                .filter(c -> "tool_use".equals(c.getType()))
                .findFirst()
                .orElse(null);

        if (toolUseContent == null) {
            return "Error: Claude requested tool use but no tool call found.";
        }

        String toolName = toolUseContent.getName();
        String toolCallId = toolUseContent.getId();
        Map<String, Object> input = toolUseContent.getInput();

        log.info("Executing tool: {}", toolName);
        AiTool aiTool = toolRegistry.getToolByName(toolName);
        
        if (aiTool == null || !aiTool.isAllowedForRole(userRole)) {
            return "Error: Tool " + toolName + " is not available or unauthorized for role: " + userRole;
        }

        // Execute backend tool logic
        String toolResultJson = aiTool.execute(input);

        // Build the new messages list including the tool result
        List<AnthropicRequest.Message> messages = new ArrayList<>(originalRequest.getMessages());
        
        // Add Assistant's original tool_use request message to history
        messages.add(AnthropicRequest.Message.builder()
                .role("assistant")
                .content(toolUseResponse.getContent())
                .build());

        // Add User's tool_result message
        messages.add(AnthropicRequest.Message.builder()
                .role("user")
                .content(List.of(
                        Map.of(
                                "type", "tool_result",
                                "tool_use_id", toolCallId,
                                "content", toolResultJson
                        )
                ))
                .build());

        AnthropicRequest followupRequest = AnthropicRequest.builder()
                .model(originalRequest.getModel())
                .system(originalRequest.getSystem())
                .maxTokens(originalRequest.getMaxTokens())
                .temperature(originalRequest.getTemperature())
                .topP(originalRequest.getTopP())
                .tools(originalRequest.getTools())
                .messages(messages)
                .build();

        log.info("Sending tool results back to Claude...");
        AnthropicResponse followupResponse = anthropicService.callClaude(followupRequest);

        return extractTextFromResponse(followupResponse);
    }

    private String extractTextFromResponse(AnthropicResponse response) {
        if (response != null && response.getContent() != null && !response.getContent().isEmpty()) {
            return response.getContent().get(0).getText();
        }
        return "Error: Empty response from AI Assistant.";
    }

    private String getSystemPromptForRole(String role, String subject) {
        String tenantId = TenantContext.getCurrentTenant();
        
        String basePrompt = "System Role: You are Elsa, an AI Copilot for the School ERP system. " +
                            "Your behavior changes based on the user's role: Admin, Teacher, or Student.\n" +
                            "Interaction Flow: Always acknowledge the user role first.\n" +
                            "Response Style: Clear, concise, actionable. Avoid hallucinations; if data is unavailable, explicitly say so.\n\n";

        return switch (role.toUpperCase()) {
            case "SUPER_ADMIN" -> basePrompt + """
                    Role: SUPER_ADMIN
                    You are an expert AI platform manager for a multi-tenant School ERP system.
                    You have access to cross-tenant analytical data.
                    Proactive Use of Tools: When answering questions that require data, call the appropriate ERP backend APIs.
                    Always summarize data before providing insights. Provide actionable recommendations, not just raw numbers.
                    Include suggested next steps in bullet form.
                    """;
            case "ADMIN" -> basePrompt + String.format("""
                    Role: ADMIN
                    You are assisting an admin for the school with ID: %s.
                    Instructions: Provide school-wide insights, performance summaries, attendance trends, fee defaulters, teacher workload, and actionable recommendations.
                    Proactive Use of Tools: When answering questions that require data, call the appropriate ERP backend APIs.
                    Always summarize data before providing insights. Provide actionable recommendations, not just raw numbers.
                    Include suggested next steps in bullet form.
                    You must ONLY provide information related to this exact school. Refuse any requests for cross-school data.
                    """, tenantId);
            case "TEACHER" -> basePrompt + String.format("""
                    Role: TEACHER
                    You are assisting a teacher at the school with ID: %s.
                    Instructions: Focus on class-level performance, weak students/topics, generate revision questions, and suggest homework tailored to class needs.
                    Proactive Use of Tools: When answering questions that require data, call the appropriate ERP backend APIs.
                    Always summarize data before providing insights. Provide actionable recommendations, not just raw numbers.
                    Include suggested next steps in bullet form.
                    You must ONLY provide information related to classes assigned to the current teacher.
                    """, tenantId);
            case "STUDENT" -> {
                String subjectContext = (subject != null && !subject.trim().isEmpty() && !"General".equalsIgnoreCase(subject))
                        ? "Subject Context: Inject focus on " + subject + " into all responses. Include performance metrics, weak areas, and recent exam history related to this subject.\n" : "";
                yield basePrompt + String.format("""
                    Role: STUDENT
                    You are helping a student at the school with ID: %s.
                    Instructions: Act as a personal tutor. Leverage the student's historical performance, selected subject, weak topics, and recent exam scores to explain concepts, provide exercises, and guide learning.
                    %s
                    Always focus your teaching on areas where the student is struggling.
                    Response Style: Include hints, exercises, and step-by-step explanations. Tailor teaching content to weak areas and recent performance.
                    You DO NOT have access to ERP operational reports or school financial data. If asked, politely refuse and stick to academics.
                    """, tenantId, subjectContext);
            }
            default -> basePrompt + "You are a helpful AI assistant.";
        };
    }
}
