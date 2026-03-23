package com.schoolerp.core.repository;

import com.schoolerp.core.entity.TeacherAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, String> {
    List<TeacherAvailability> findByTeacherId(String teacherId);

    Optional<TeacherAvailability> findByTeacherIdAndDayIdAndBlockId(String teacherId, String dayId, String blockId);

    List<TeacherAvailability> findByTeacherIdAndIsAvailableFalse(String teacherId);

    void deleteByBlockId(String blockId);
    void deleteByDayId(String dayId);
}
