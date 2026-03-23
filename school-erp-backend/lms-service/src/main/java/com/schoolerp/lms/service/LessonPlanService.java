package com.schoolerp.lms.service;

import com.schoolerp.lms.entity.LessonPlan;
import com.schoolerp.lms.repository.LessonPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonPlanService {

    private final LessonPlanRepository repository;

    public LessonPlan create(LessonPlan plan) {
        return repository.save(plan);
    }

    public List<LessonPlan> getByTeacher(String teacherId) {
        return repository.findByTeacherId(teacherId);
    }

    public List<LessonPlan> getByAssignment(String classSubjectTeacherId) {
        return repository.findByClassSubjectTeacherId(classSubjectTeacherId);
    }

    public List<LessonPlan> getByGradeLevel(Integer gradeLevel) {
        return repository.findByGradeLevel(gradeLevel);
    }

    public List<LessonPlan> getPendingVerifications() {
        return repository.findByStatus("PENDING");
    }

    public LessonPlan updateStatus(String id, String status) {
        Optional<LessonPlan> optional = repository.findById(id);
        if (optional.isPresent()) {
            LessonPlan plan = optional.get();
            plan.setStatus(status);
            return repository.save(plan);
        }
        throw new RuntimeException("LessonPlan not found");
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
