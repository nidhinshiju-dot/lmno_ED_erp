package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, String> {
    List<StudyPlan> findByTutorIdOrderByCreatedAtDesc(String tutorId);
}
