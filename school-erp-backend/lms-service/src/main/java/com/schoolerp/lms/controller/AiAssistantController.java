package com.schoolerp.lms.controller;

import com.schoolerp.lms.dto.ai.AiChatRequest;
import com.schoolerp.lms.dto.ai.AiChatResponse;
import com.schoolerp.lms.service.ai.AiAssistantService;
import com.schoolerp.lms.service.ai.rag.DocumentProcessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;
    private final DocumentProcessorService documentProcessorService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        String response = aiAssistantService.processQuery(request);
        return ResponseEntity.ok(AiChatResponse.builder().response(response).build());
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherId") String teacherId,
            @RequestParam("courseId") String courseId) {
        
        try {
            documentProcessorService.processTeacherUpload(file, teacherId, courseId);
            return ResponseEntity.ok(Map.of("message", "Document processed and stored in vector database successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
