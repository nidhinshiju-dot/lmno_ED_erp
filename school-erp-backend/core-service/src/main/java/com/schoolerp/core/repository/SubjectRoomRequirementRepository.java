package com.schoolerp.core.repository;

import com.schoolerp.core.entity.SubjectRoomRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRoomRequirementRepository extends JpaRepository<SubjectRoomRequirement, String> {
    List<SubjectRoomRequirement> findBySubjectId(String subjectId);

    Optional<SubjectRoomRequirement> findBySubjectIdAndIsRequiredTrue(String subjectId);
}
