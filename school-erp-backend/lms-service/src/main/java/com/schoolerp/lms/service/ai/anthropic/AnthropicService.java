package com.schoolerp.lms.service.ai.anthropic;

import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class AnthropicService {

    private final WebClient webClient;
    private final String apiKey;

    public AnthropicService(WebClient.Builder webClientBuilder, 
                            @Value("${anthropic.api.key}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://api.anthropic.com/v1").build();
        this.apiKey = apiKey;
    }

    public AnthropicResponse callClaude(AnthropicRequest request) {
        return webClient.post()
                .uri("/messages")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .body(Mono.just(request), AnthropicRequest.class)
                .retrieve()
                .bodyToMono(AnthropicResponse.class)
                .block();
    }
}
