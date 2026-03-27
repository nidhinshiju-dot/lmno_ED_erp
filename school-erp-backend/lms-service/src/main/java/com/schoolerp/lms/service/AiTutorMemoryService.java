package com.schoolerp.lms.service;

import com.schoolerp.lms.context.RequestContext;
import com.schoolerp.lms.dto.ai.AdvancedStudyPlanDto;
import com.schoolerp.lms.dto.ai.AiTutorMemoryDto;
import com.schoolerp.lms.dto.ai.AiTutorPreferenceDto;
import com.schoolerp.lms.dto.ai.ExamPlanDto;
import com.schoolerp.lms.entity.ai.AiTutorMemory;
import com.schoolerp.lms.entity.ai.AiTutorPreference;
import com.schoolerp.lms.repository.ai.AiTutorMemoryRepository;
import com.schoolerp.lms.repository.ai.AiTutorPreferenceRepository;
import com.schoolerp.lms.repository.ai.AiTutorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTutorMemoryService {

    private final AiTutorPreferenceRepository preferenceRepository;
    private final AiTutorMemoryRepository memoryRepository;
    private final AiTutorRepository tutorRepository;

    private String getTenantId() {
        RequestContext context = RequestContext.getContext();
        if (context == null || context.getTenantId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context required");
        }
        return context.getTenantId();
    }

    private String getStudentId() {
        RequestContext context = RequestContext.getContext();
        if (context == null || !"STUDENT".equalsIgnoreCase(context.getUserRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Requires STUDENT role");
        }
        return context.getStudentId();
    }

    private void validateTutorOwnership(String tutorId) {
        String tenantId = getTenantId();
        String studentId = getStudentId();
        tutorRepository.findByIdAndTenantIdAndStudentId(tutorId, tenantId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Tutor validation failed."));
    }

    // --- PREFERENCES ---

    public AiTutorPreferenceDto getPreferences(String tutorId) {
        validateTutorOwnership(tutorId);
        AiTutorPreference pref = preferenceRepository.findByTenantIdAndTutorIdAndStudentId(getTenantId(), tutorId, getStudentId())
                .orElseGet(() -> {
                    AiTutorPreference p = new AiTutorPreference();
                    p.setTenantId(getTenantId());
                    p.setTutorId(tutorId);
                    p.setStudentId(getStudentId());
                    return preferenceRepository.save(p);
                });
        return toDto(pref);
    }

    public AiTutorPreferenceDto updatePreferences(String tutorId, AiTutorPreferenceDto dto) {
        validateTutorOwnership(tutorId);
        AiTutorPreference pref = preferenceRepository.findByTenantIdAndTutorIdAndStudentId(getTenantId(), tutorId, getStudentId())
                .orElseGet(AiTutorPreference::new);

        pref.setTenantId(getTenantId());
        pref.setTutorId(tutorId);
        pref.setStudentId(getStudentId());
        pref.setExplanationStyle(dto.getExplanationStyle() != null ? dto.getExplanationStyle() : pref.getExplanationStyle());
        pref.setAnswerLength(dto.getAnswerLength() != null ? dto.getAnswerLength() : pref.getAnswerLength());
        pref.setPreferExamples(dto.getPreferExamples() != null ? dto.getPreferExamples() : pref.getPreferExamples());
        pref.setPreferFormulas(dto.getPreferFormulas() != null ? dto.getPreferFormulas() : pref.getPreferFormulas());
        pref.setPreferTheory(dto.getPreferTheory() != null ? dto.getPreferTheory() : pref.getPreferTheory());
        pref.setGoalType(dto.getGoalType() != null ? dto.getGoalType() : pref.getGoalType());

        return toDto(preferenceRepository.save(pref));
    }

    // --- MEMORY ---

    public List<AiTutorMemoryDto> getMemory(String tutorId) {
        validateTutorOwnership(tutorId);
        return memoryRepository.findByTenantIdAndTutorIdAndStudentIdOrderByImportanceDesc(getTenantId(), tutorId, getStudentId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AiTutorMemoryDto> refreshMemory(String tutorId) {
        validateTutorOwnership(tutorId);
        String tenantId = getTenantId();
        String studentId = getStudentId();

        // 1. Clean old memory boundaries implicitly capping growth
        memoryRepository.deleteByTenantIdAndTutorIdAndStudentId(tenantId, tutorId, studentId);
        
        log.info("[AI_TUTOR_MEMORY] Memory Refresh triggered. tenantId={}, studentId={}, tutorId={}", tenantId, studentId, tutorId);

        // 2. Synthesize new memory (mocking reading history)
        AiTutorMemory mem1 = new AiTutorMemory();
        mem1.setTenantId(tenantId);
        mem1.setTutorId(tutorId);
        mem1.setStudentId(studentId);
        mem1.setMemoryType("LEARNING_PATTERN");
        mem1.setMemoryKey("struggles_with_pacing");
        mem1.setMemoryValueJson("{\"observation\": \"Needs more time on long-form questions\"}");
        mem1.setImportance(5);

        AiTutorMemory mem2 = new AiTutorMemory();
        mem2.setTenantId(tenantId);
        mem2.setTutorId(tutorId);
        mem2.setStudentId(studentId);
        mem2.setMemoryType("TOPIC_STRUGGLE");
        mem2.setMemoryKey("calculus_derivatives");
        mem2.setMemoryValueJson("{\"observation\": \"Frequently asks to review the chain rule\"}");
        mem2.setImportance(4);

        memoryRepository.saveAll(List.of(mem1, mem2));

        return getMemory(tutorId);
    }

    public AdvancedStudyPlanDto generateAdvancedStudyPlan(String tutorId) {
        validateTutorOwnership(tutorId);
        AiTutorPreferenceDto pref = getPreferences(tutorId);
        List<AiTutorMemoryDto> memories = getMemory(tutorId);

        AdvancedStudyPlanDto dto = new AdvancedStudyPlanDto();
        dto.setTutorId(tutorId);
        dto.setFocusGoal(pref.getGoalType());

        List<Map<String, String>> contextual = memories.stream()
                .map(m -> Map.of("module", m.getMemoryKey(), "observation", m.getMemoryValueJson()))
                .collect(Collectors.toList());
        dto.setContextualModules(contextual);

        List<ExamPlanDto.PlanItem> schedule = new ArrayList<>();
        schedule.add(new ExamPlanDto.PlanItem("Week 1", "Core Weaknesses (" + pref.getGoalType() + ")", "Reviewing " + (contextual.isEmpty() ? "Fundamentals" : contextual.get(0).get("module")), "High"));
        schedule.add(new ExamPlanDto.PlanItem("Week 2", "Exam Strategies", pref.getPreferExamples() ? "Mock Tests with Examples" : "Theory Validation", "Medium"));
        
        dto.setTailoredSchedule(schedule);
        return dto;
    }

    // --- MAPPERS ---

    private AiTutorPreferenceDto toDto(AiTutorPreference p) {
        return new AiTutorPreferenceDto(p.getId(), p.getTutorId(), p.getExplanationStyle(),
                p.getAnswerLength(), p.getPreferExamples(), p.getPreferFormulas(), p.getPreferTheory(), p.getGoalType());
    }

    private AiTutorMemoryDto toDto(AiTutorMemory m) {
        return new AiTutorMemoryDto(m.getId(), m.getTutorId(), m.getMemoryType(),
                m.getMemoryKey(), m.getMemoryValueJson(), m.getImportance(), m.getLastUsedAt(), m.getUpdatedAt());
    }
}
