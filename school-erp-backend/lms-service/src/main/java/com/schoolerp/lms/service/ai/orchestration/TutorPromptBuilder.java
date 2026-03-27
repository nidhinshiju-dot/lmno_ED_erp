package com.schoolerp.lms.service.ai.orchestration;

import com.schoolerp.lms.repository.ai.AiPromptTemplateVersionRepository;
import com.schoolerp.lms.entity.ai.AiPromptTemplateVersion;
import dev.langchain4j.data.message.SystemMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TutorPromptBuilder {

    private final AiPromptTemplateVersionRepository templateRepository;

    public SystemMessage buildSystemInstruction(String tenantId, String operationType) {
        String defaultInstruction = "You are a helpful academic AI Tutor. Assist the student using strict syllabus bounds.";
        
        switch(operationType) {
            case "EXPLAIN_TOPIC":
                defaultInstruction = "You are an AI Tutor explaining a topic. Break it down strictly to grade-appropriate levels relying upon analogies. Do NOT give away homework solutions directly. Adhere strictly to the student's preferences.";
                break;
            case "PRACTICE":
                defaultInstruction = "You are an AI Tutor generating practice questions. You MUST return ONLY a raw JSON array matching this exact schema: [{\"question\": \"...\", \"type\": \"...\"}]. DO NOT include any conversational text, markdown formatting blocks (e.g. ```json), or explanations outside the JSON structure.";
                break;
            case "QUIZ":
                defaultInstruction = "You are an AI Tutor building a structured multiple-choice quiz. You MUST return ONLY a raw JSON array of questions. DO NOT wrap your response in markdown code blocks or add any conversational text.";
                break;
            case "REVISE_TOPIC":
                defaultInstruction = "You are an AI Tutor revising a weak topic. Synthesize key concepts quickly and clearly, prioritizing high-yield summary points directly targeted at the student's learning gaps.";
                break;
        }

        AiPromptTemplateVersion version = templateRepository.findByTenantIdAndTemplateKeyAndIsActiveTrue(tenantId, operationType)
            .orElse(null);

        String prompt = version != null ? version.getSystemPrompt() : defaultInstruction;
        
        return SystemMessage.from(prompt);
    }
}
