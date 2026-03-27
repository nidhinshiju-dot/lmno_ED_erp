package com.schoolerp.lms.service;

import com.schoolerp.lms.context.RequestContext;
import com.schoolerp.lms.entity.ai.AiTutor;
import com.schoolerp.lms.entity.ai.AiTutorMessage;
import com.schoolerp.lms.entity.ai.AiTutorSession;
import com.schoolerp.lms.entity.ai.StudyPlan;
import com.schoolerp.lms.repository.ai.AiTutorMessageRepository;
import com.schoolerp.lms.repository.ai.AiTutorRepository;
import com.schoolerp.lms.repository.ai.AiTutorSessionRepository;
import com.schoolerp.lms.repository.ai.StudyPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTutorService {

    private final AiTutorRepository aiTutorRepository;
    private final AiTutorSessionRepository sessionRepository;
    private final AiTutorMessageRepository messageRepository;
    private final StudyPlanRepository studyPlanRepository;

    private String getTenantId() {
        return RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
    }

    private String getStudentId() {
        RequestContext context = RequestContext.getContext();
        if (context == null || !"STUDENT".equalsIgnoreCase(context.getUserRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can use AI Tutor");
        }
        return context.getStudentId();
    }

    public AiTutor createTutor(String name) {
        String studentId = getStudentId();
        String tenantId = getTenantId();

        long activeCount = aiTutorRepository.countByTenantIdAndStudentIdAndStatus(tenantId, studentId, "ACTIVE");
        if (activeCount >= 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 5 active tutors allowed");
        }

        AiTutor tutor = new AiTutor();
        tutor.setTenantId(getTenantId());
        tutor.setStudentId(studentId);
        tutor.setName(name);

        return aiTutorRepository.save(tutor);
    }

    public List<AiTutor> getTutors() {
        return aiTutorRepository.findByTenantIdAndStudentId(getTenantId(), getStudentId());
    }

    public AiTutor getTutor(String tutorId) {
        return aiTutorRepository.findByIdAndTenantIdAndStudentId(tutorId, getTenantId(), getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor not found"));
    }

    public AiTutor deactivateTutor(String tutorId) {
        AiTutor tutor = getTutor(tutorId);
        tutor.setStatus("INACTIVE");
        return aiTutorRepository.save(tutor);
    }

    public AiTutorSession createSession(String tutorId) {
        AiTutor tutor = getTutor(tutorId);
        if ("INACTIVE".equals(tutor.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot start session on inactive tutor");
        }

        AiTutorSession session = new AiTutorSession();
        session.setTenantId(getTenantId());
        session.setTutorId(tutorId);
        return sessionRepository.save(session);
    }

    public AiTutorMessage chat(String tutorId, Map<String, String> payload) {
        getTutor(tutorId); // Validates ownership
        String sessionId = payload.get("sessionId");
        String content = payload.get("content");

        if (sessionId == null || content == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sessionId and content are required");
        }

        AiTutorSession session = sessionRepository.findByIdAndTenantIdAndTutorId(sessionId, getTenantId(), tutorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found for this tutor"));

        // Save User Message
        AiTutorMessage userMsg = new AiTutorMessage();
        userMsg.setTenantId(getTenantId());
        userMsg.setSessionId(sessionId);
        userMsg.setSenderRole("USER");
        userMsg.setContent(content);
        messageRepository.save(userMsg);

        // Remove the dummy AI Engine logic here; only save User Message
        log.info("[AI_TUTOR_CHAT] User appended message. tenantId={}, studentId={}, tutorId={}, sessionId={}", getTenantId(), getStudentId(), tutorId, sessionId);
        return userMsg;
    }

    public StudyPlan createStudyPlan(String tutorId, Map<String, String> payload) {
        getTutor(tutorId); // Validate ownership
        String title = payload.getOrDefault("title", "Weekly Study Plan");
        
        // Dummy Implementation logic (Generic fallback)
        String planContent = "{ \"tasks\": [\"Review Chapter 1\", \"Complete Worksheet 2\"] }";

        StudyPlan plan = new StudyPlan();
        plan.setTenantId(getTenantId());
        plan.setTutorId(tutorId);
        plan.setTitle(title);
        plan.setContent(planContent);

        return studyPlanRepository.save(plan);
    }
    
    public org.springframework.data.domain.Page<AiTutorSession> getSessions(String tutorId, int page, int size) {
        getTutor(tutorId);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100));
        return sessionRepository.findByTenantIdAndTutorIdOrderBySessionStartDesc(getTenantId(), tutorId, pageable);
    }

    public org.springframework.data.domain.Page<AiTutorMessage> getMessages(String sessionId, int page, int size) {
        String tenantId = getTenantId();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100));
        return messageRepository.findByTenantIdAndSessionIdOrderByTimestampDesc(tenantId, sessionId, pageable);
    }
}
