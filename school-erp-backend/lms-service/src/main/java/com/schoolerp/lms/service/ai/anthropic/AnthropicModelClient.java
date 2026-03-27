package com.schoolerp.lms.service.ai.anthropic;

import com.schoolerp.lms.dto.ai.AnthropicResponseDto;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Component
public class AnthropicModelClient {

    private final Map<String, ChatLanguageModel> models = new HashMap<>();

    public AnthropicModelClient(
            @Value("${anthropic.api.key}") String apiKey,
            @Value("${anthropic.routing.default-model:claude-3-haiku-20240307}") String defaultModel,
            @Value("${anthropic.routing.complex-model:claude-3-5-sonnet-20241022}") String complexModel,
            @Value("${anthropic.client.timeout:5000}") long timeoutMs) {

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("default_dev_key")) {
            log.warn("Anthropic API Key represents placeholder. Relying strictly on Native Fallbacks.");
        } else {
            // LangChain4j 0.31.0 abstracting Anthropic doesn't expose native explicit "cache_control" hooks transparently 
            // inside ChatLanguageModel abstraction yet without low level intercepts. 
            // We rely implicitly on stable history sequencing and explicitly document this constraint.
            models.put("default", AnthropicChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(defaultModel)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .maxTokens(1000)
                    .build());
                    
            models.put("complex", AnthropicChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(complexModel)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .maxTokens(1500)
                    .build());
        }
    }

    public AnthropicResponseDto generateResponse(List<ChatMessage> messages, String routingKey) {
        long startTime = System.currentTimeMillis();
        ChatLanguageModel targetedModel = models.getOrDefault(routingKey, models.get("default"));
        
        if (targetedModel == null) {
            log.warn("Targeted model inaccessible routing={}. Firing uncoupled fallback.", routingKey);
            return AnthropicResponseDto.builder()
                    .response(new Response<>(AiMessage.from("I’m having trouble generating a live AI response right now. I can still help using your syllabus and study data. Please try again, or ask for a study plan, weak topics, or revision help."), null, null))
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .modelRequested(routingKey)
                    .modelUsed("fallback-internal")
                    .status("FALLBACK")
                    .cacheHit(false)
                    .build();
        }

        try {
            Response<AiMessage> rsp = targetedModel.generate(messages);
            return AnthropicResponseDto.builder()
                    .response(rsp)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .modelRequested(routingKey)
                    .modelUsed(routingKey.equals("complex") ? "claude-3-5-sonnet-20241022" : "claude-3-haiku-20240307")
                    .status("SUCCESS")
                    .cacheHit(false) // Implicit
                    .build();
        } catch (Exception e) {
            log.error("Generation failed routing={}: {}", routingKey, e.getMessage());
            return AnthropicResponseDto.builder()
                    .response(new Response<>(AiMessage.from("I’m having trouble generating a live AI response right now. I can still help using your syllabus and study data. Please try again, or ask for a study plan, weak topics, or revision help."), null, null))
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .modelRequested(routingKey)
                    .modelUsed("fallback-internal")
                    .status("ERROR")
                    .errorCode(e.getClass().getSimpleName())
                    .cacheHit(false)
                    .build();
        }
    }
}
