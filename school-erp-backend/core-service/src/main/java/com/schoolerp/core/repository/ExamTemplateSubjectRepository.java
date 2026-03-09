package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ExamTemplateSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamTemplateSubjectRepository extends JpaRepository<ExamTemplateSubject, String> {
    List<ExamTemplateSubject> findByTemplateId(String templateId);
}
