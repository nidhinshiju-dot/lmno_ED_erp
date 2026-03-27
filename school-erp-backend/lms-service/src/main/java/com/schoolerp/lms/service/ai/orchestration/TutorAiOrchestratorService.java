package com.schoolerp.lms.service.ai.orchestration;

import com.schoolerp.lms.dto.ai.AnthropicResponseDto;
import com.schoolerp.lms.context.RequestContext;
import com.schoolerp.lms.entity.ai.AiUsageLog;
import com.schoolerp.lms.entity.ai.AiTutorMessage;
import com.schoolerp.lms.repository.ai.AiTutorMessageRepository;
import com.schoolerp.lms.repository.ai.AiUsageLogRepository;
import com.schoolerp.lms.service.ai.anthropic.AnthropicModelClient;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.data.message.AiMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorAiOrchestratorService {

    @Value("${anthropic.context.max-history-messages:5}")
    private int maxHistoryMessages;

    private final AnthropicModelClient modelClient;
    private final TutorContextAssembler contextAssembler;
    private final TutorPromptBuilder promptBuilder;
    private final TutorSafetyFilter safetyFilter;
    
    private final AiTutorMessageRepository messageRepository;
    private final AiUsageLogRepository usageLogRepository;

    private String getTenantId() {
        return RequestContext.getContext().getTenantId();
    }
    
    private String getStudentId() {
        return RequestContext.getContext().getStudentId();
    }

    @Transactional
    public AiTutorMessage OrchestrateChat(String tutorId, String sessionId, String userMessage) {
        safetyFilter.validateSafeInput(userMessage);
        
        // 1. Context Build
        String contextualizedPrompt = contextAssembler.buildContextualPrefix(tutorId, userMessage);
        SystemMessage sysMsg = promptBuilder.buildSystemInstruction(getTenantId(), "CHAT");
        
        List<ChatMessage> conversation = new ArrayList<>();
        conversation.add(sysMsg);
        
        // Load recent history securely 
        List<AiTutorMessage> history = messageRepository.findByTenantIdAndSessionIdOrderByTimestampDesc(getTenantId(), sessionId, PageRequest.of(0, maxHistoryMessages)).getContent();
        // Since it's Desc, Reverse to chronological
        for (int i = history.size() - 1; i >= 0; i--) {
            AiTutorMessage m = history.get(i);
            if ("USER".equals(m.getSenderRole())) conversation.add(UserMessage.from(m.getContent()));
            else conversation.add(AiMessage.from(m.getContent()));
        }
        
        conversation.add(UserMessage.from(contextualizedPrompt));

        int complexityScore = calculateComplexity(userMessage);
        String routingBehavior = complexityScore >= 80 ? "complex" : "default";

        // 2. Transact with Claude
        AnthropicResponseDto responseObj = modelClient.generateResponse(conversation, routingBehavior);
        String finalOutput = safetyFilter.sanitizeOutput(responseObj.getResponse().content().text());
        
        // 3. Log Usage
        logUsage(tutorId, "CHAT", responseObj);

        // 4. Save Final AI Message
        AiTutorMessage aiMsg = new AiTutorMessage();
        aiMsg.setTenantId(getTenantId());
        aiMsg.setSessionId(sessionId);
        aiMsg.setSenderRole("AI");
        aiMsg.setContent(finalOutput);
        
        return messageRepository.save(aiMsg);
    }
    
    public AiTutorMessage executeAndAppend(String tutorId, String sessionId, String actionType, String topic) {
        safetyFilter.validateSafeInput(topic);
        
        String instruction = contextAssembler.buildContextualPrefix(tutorId, "Focus entirely on: " + topic);
        SystemMessage sysMsg = promptBuilder.buildSystemInstruction(getTenantId(), actionType);
        
        List<ChatMessage> msgs = List.of(sysMsg, UserMessage.from(instruction));
        
        int complexityScore = calculateComplexity(topic);
        String routing = complexityScore >= 70 ? "complex" : "default";
        
        AnthropicResponseDto responseObj = modelClient.generateResponse(msgs, routing);
        logUsage(tutorId, actionType, responseObj);
        
        String finalOutput = safetyFilter.sanitizeOutput(responseObj.getResponse().content().text());
        
        AiTutorMessage aiMsg = new AiTutorMessage();
        aiMsg.setTenantId(getTenantId());
        aiMsg.setSessionId(sessionId);
        aiMsg.setSenderRole("AI");
        aiMsg.setContent(finalOutput);
        
        return messageRepository.save(aiMsg);
    }
    
    public String executeAction(String tutorId, String actionType, String topic) {
        safetyFilter.validateSafeInput(topic);
        
        String instruction = contextAssembler.buildContextualPrefix(tutorId, "Focus entirely on: " + topic);
        SystemMessage sysMsg = promptBuilder.buildSystemInstruction(getTenantId(), actionType);
        
        List<ChatMessage> msgs = List.of(sysMsg, UserMessage.from(instruction));
        
        int complexityScore = calculateComplexity(topic);
        String routing = complexityScore >= 80 ? "complex" : "default"; // Phase 4C: Escalate bound from 70 to 80 natively
        
        AnthropicResponseDto responseObj = modelClient.generateResponse(msgs, routing);
        
        // Escalation loop natively checking JSON valid outputs matching Quiz and Practice bounds
        if ((actionType.equals("PRACTICE") || actionType.equals("QUIZ")) && routing.equals("default")) {
            String tempOut = safetyFilter.sanitizeOutput(responseObj.getResponse().content().text());
            if (responseObj.getStatus().equals("FALLBACK") || tempOut.length() < 50 || (!tempOut.startsWith("[") && !tempOut.startsWith("{"))) {
                log.warn("[ORCHESTRATOR] Escalating to complex model. fallback={}, len={}, startsWithJson={}", responseObj.getStatus().equals("FALLBACK"), tempOut.length(), tempOut.startsWith("["));
                responseObj = modelClient.generateResponse(msgs, "complex");
                responseObj.setStatus("ESCALATED");
            }
        }
        
        logUsage(tutorId, actionType, responseObj);
        
        return safetyFilter.sanitizeOutput(responseObj.getResponse().content().text());
    }
    
    // --- Phase 4B Heuristics ---
    
    private int calculateComplexity(String text) {
        if (text == null) return 0;
        int score = 0;
        // Require significantly larger inputs to scale generic length metrics
        if (text.length() > 500) score += 30;
        else if (text.length() > 200) score += 15;
        
        String lowerInput = text.toLowerCase();
        boolean hasComplexKeyword = false;
        
        if (lowerInput.contains("derive") || lowerInput.contains("analyze") || lowerInput.contains("prove")) {
            score += 35;
            hasComplexKeyword = true;
        }
        if (lowerInput.contains("step by step") || lowerInput.contains("compare") || lowerInput.contains("exam plan") || lowerInput.contains("strategy") || lowerInput.contains("synthesize")) {
            score += 25;
            hasComplexKeyword = true;
        }
        if (lowerInput.contains("why")) score += 10;
        
        // Only allow score ceiling > 80 if explicit logic triggers are matched natively scaling long queries organically
        if (score > 80 && !hasComplexKeyword) return 60;
        
        return score;
    }

    private void logUsage(String tutorId, String endpoint, AnthropicResponseDto output) {
        AiUsageLog logEntry = new AiUsageLog();
        logEntry.setTenantId(getTenantId());
        logEntry.setStudentId(getStudentId());
        logEntry.setTutorId(tutorId);
        logEntry.setEndpoint(endpoint);
        logEntry.setLatencyMs(output.getLatencyMs());
        logEntry.setStatus(output.getStatus());
        logEntry.setModelRequested(output.getModelRequested());
        logEntry.setModelUsed(output.getModelUsed());
        logEntry.setCacheHit(output.isCacheHit());
        logEntry.setErrorCode(output.getErrorCode());
        
        if (output.getResponse() != null && output.getResponse().tokenUsage() != null) {
            logEntry.setPromptTokens(output.getResponse().tokenUsage().inputTokenCount());
            logEntry.setCompletionTokens(output.getResponse().tokenUsage().outputTokenCount());
        }
        
        usageLogRepository.save(logEntry);
    }
}
