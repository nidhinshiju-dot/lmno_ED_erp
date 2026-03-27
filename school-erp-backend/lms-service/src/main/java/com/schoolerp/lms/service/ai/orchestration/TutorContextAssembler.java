package com.schoolerp.lms.service.ai.orchestration;

import com.schoolerp.lms.dto.ai.AiTutorPreferenceDto;
import com.schoolerp.lms.service.AiTutorMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TutorContextAssembler {

    private final AiTutorMemoryService memoryService;
    
    @Value("${anthropic.context.max-memory-items:5}")
    private int maxMemoryItems;

    public String buildContextualPrefix(String tutorId, String baseInteraction) {
        AiTutorPreferenceDto prefs = memoryService.getPreferences(tutorId);
        
        String memoryContext = memoryService.getMemory(tutorId).stream()
                .sorted(Comparator.comparing(com.schoolerp.lms.dto.ai.AiTutorMemoryDto::getImportance).reversed()
                                  .thenComparing(com.schoolerp.lms.dto.ai.AiTutorMemoryDto::getLastUsedAt).reversed())
                .limit(maxMemoryItems)
                .map(m -> m.getMemoryKey() + ": " + m.getMemoryValueJson())
                .collect(Collectors.joining(" | "));

        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("Context Requirements:\n");
        contextBuilder.append("- Explanation Style: ").append(prefs.getExplanationStyle()).append("\n");
        contextBuilder.append("- Answer Length: ").append(prefs.getAnswerLength()).append("\n");
        if (prefs.getPreferExamples()) contextBuilder.append("- Include Examples extensively.\n");
        if (prefs.getPreferFormulas()) contextBuilder.append("- Include Mathematical/Scientific formulas natively.\n");
        
        contextBuilder.append("\nStudent Memories to Accommodate:\n");
        contextBuilder.append(memoryContext.isEmpty() ? "None yet." : memoryContext).append("\n\n");
        
        contextBuilder.append("User Request:\n").append(baseInteraction);

        return contextBuilder.toString();
    }
}
