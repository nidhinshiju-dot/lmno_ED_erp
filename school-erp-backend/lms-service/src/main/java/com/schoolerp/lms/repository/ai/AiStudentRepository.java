package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiStudent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiStudentRepository extends JpaRepository<AiStudent, String> {
}
