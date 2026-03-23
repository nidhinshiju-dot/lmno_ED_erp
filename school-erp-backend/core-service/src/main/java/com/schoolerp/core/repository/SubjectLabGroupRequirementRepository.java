package com.schoolerp.core.repository;

import com.schoolerp.core.entity.SubjectLabGroupRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubjectLabGroupRequirementRepository extends JpaRepository<SubjectLabGroupRequirement, String> {
    Optional<SubjectLabGroupRequirement> findBySubjectId(String subjectId);
}
