package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.ai.AiTutor;
import com.schoolerp.lms.entity.ai.AiTutorMessage;
import com.schoolerp.lms.entity.ai.AiTutorSession;
import com.schoolerp.lms.entity.ai.StudyPlan;
import com.schoolerp.lms.service.AiTutorService;
import com.schoolerp.lms.service.AiTutorInsightService;
import com.schoolerp.lms.service.AiTutorMemoryService;
import com.schoolerp.lms.service.ai.orchestration.TutorAiOrchestratorService;
import com.schoolerp.lms.dto.ai.AiTutorInsightDto;
import com.schoolerp.lms.dto.ai.ExamPlanDto;
import com.schoolerp.lms.dto.ai.AiTutorPreferenceDto;
import com.schoolerp.lms.dto.ai.AiTutorMemoryDto;
import com.schoolerp.lms.dto.ai.AdvancedStudyPlanDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai-tutors")
@RequiredArgsConstructor
public class AiTutorController {

    private final AiTutorService aiTutorService;
    private final AiTutorInsightService insightService;
    private final AiTutorMemoryService memoryService;
    private final TutorAiOrchestratorService orchestratorService;

    @PostMapping
    public ResponseEntity<AiTutor> createTutor(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(aiTutorService.createTutor(payload.get("name")));
    }

    @GetMapping
    public ResponseEntity<List<AiTutor>> getTutors() {
        return ResponseEntity.ok(aiTutorService.getTutors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiTutor> getTutor(@PathVariable String id) {
        return ResponseEntity.ok(aiTutorService.getTutor(id));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<AiTutor> deactivateTutor(@PathVariable String id) {
        return ResponseEntity.ok(aiTutorService.deactivateTutor(id));
    }

    @PostMapping("/{id}/sessions")
    public ResponseEntity<AiTutorSession> createSession(@PathVariable String id) {
        return ResponseEntity.ok(aiTutorService.createSession(id));
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<AiTutorMessage> chat(
            @PathVariable String id, 
            @RequestBody Map<String, String> payload) {
        // Intercepting legacy dummy hook with LangChain Orchestrator
        String sessionId = payload.get("sessionId");
        String content = payload.get("content");
        
        // Save user message via basic service logic first 
        aiTutorService.chat(id, payload);
        
        return ResponseEntity.ok(orchestratorService.OrchestrateChat(id, sessionId, content));
    }
    
    // --- Phase 4 Orchestration Operations ---
    
    @PostMapping("/{id}/explain-topic")
    public ResponseEntity<AiTutorMessage> explainTopic(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String topic = payload.get("topic");
        String sessionId = payload.get("sessionId");
        return ResponseEntity.ok(orchestratorService.executeAndAppend(id, sessionId, "EXPLAIN_TOPIC", topic));
    }

    @PostMapping("/{id}/revise-topic")
    public ResponseEntity<AiTutorMessage> reviseTopic(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String topic = payload.get("topic");
        String sessionId = payload.get("sessionId");
        return ResponseEntity.ok(orchestratorService.executeAndAppend(id, sessionId, "REVISE_TOPIC", topic));
    }

    @PostMapping("/{id}/practice")
    public ResponseEntity<Map<String, String>> practice(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String topic = payload.get("topic");
        String output = orchestratorService.executeAction(id, "PRACTICE", topic);
        return ResponseEntity.ok(Map.of("type", "PRACTICE_MODE", "payload", output));
    }

    @PostMapping("/{id}/quiz")
    public ResponseEntity<Map<String, String>> quiz(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String topic = payload.get("topic");
        String output = orchestratorService.executeAction(id, "QUIZ", topic);
        return ResponseEntity.ok(Map.of("type", "QUIZ_GENERATOR", "payload", output));
    }

    @PostMapping("/{id}/study-plan")
    public ResponseEntity<StudyPlan> createStudyPlan(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(aiTutorService.createStudyPlan(id, payload));
    }

    // --- Insights & Exam Plans ---

    @GetMapping("/{id}/insights")
    public ResponseEntity<List<AiTutorInsightDto>> getInsights(@PathVariable String id) {
        return ResponseEntity.ok(insightService.getInsights(id));
    }

    @PostMapping("/{id}/refresh-insights")
    public ResponseEntity<List<AiTutorInsightDto>> refreshInsights(@PathVariable String id) {
        return ResponseEntity.ok(insightService.refreshInsights(id));
    }

    @PostMapping("/{id}/exam-plan")
    public ResponseEntity<ExamPlanDto> getExamPlan(@PathVariable String id) {
        return ResponseEntity.ok(insightService.generateExamPlan(id));
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<org.springframework.data.domain.Page<com.schoolerp.lms.entity.ai.AiTutorSession>> getSessions(
            @PathVariable String id, 
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(aiTutorService.getSessions(id, page, size));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<org.springframework.data.domain.Page<com.schoolerp.lms.entity.ai.AiTutorMessage>> getMessages(
            @PathVariable String sessionId, 
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(aiTutorService.getMessages(sessionId, page, size));
    }

    // --- Memory & Preferences ---

    @GetMapping("/{id}/preferences")
    public ResponseEntity<AiTutorPreferenceDto> getPreferences(@PathVariable String id) {
        return ResponseEntity.ok(memoryService.getPreferences(id));
    }

    @PutMapping("/{id}/preferences")
    public ResponseEntity<AiTutorPreferenceDto> updatePreferences(@PathVariable String id, @RequestBody AiTutorPreferenceDto dto) {
        return ResponseEntity.ok(memoryService.updatePreferences(id, dto));
    }

    @GetMapping("/{id}/memory")
    public ResponseEntity<List<AiTutorMemoryDto>> getMemory(@PathVariable String id) {
        return ResponseEntity.ok(memoryService.getMemory(id));
    }

    @PostMapping("/{id}/memory/refresh")
    public ResponseEntity<List<AiTutorMemoryDto>> refreshMemory(@PathVariable String id) {
        return ResponseEntity.ok(memoryService.refreshMemory(id));
    }

    @PostMapping("/{id}/advanced-study-plan")
    public ResponseEntity<AdvancedStudyPlanDto> getAdvancedStudyPlan(@PathVariable String id) {
        return ResponseEntity.ok(memoryService.generateAdvancedStudyPlan(id));
    }
}
