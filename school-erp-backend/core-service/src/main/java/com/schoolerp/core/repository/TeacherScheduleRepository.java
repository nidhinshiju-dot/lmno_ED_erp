package com.schoolerp.core.repository;

import com.schoolerp.core.entity.TeacherSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TeacherScheduleRepository extends JpaRepository<TeacherSchedule, String> {
        List<TeacherSchedule> findByTeacherId(String teacherId);

        List<TeacherSchedule> findByTimetableIdAndTeacherId(String timetableId, String teacherId);

        Optional<TeacherSchedule> findByTimetableIdAndTeacherIdAndDayIdAndBlockId(
                        String timetableId, String teacherId, String dayId, String blockId);

        boolean existsByTimetableIdAndTeacherIdAndDayIdAndBlockId(
                        String timetableId, String teacherId, String dayId, String blockId);

        @Modifying
        @Transactional
        void deleteByTimetableId(@Param("timetableId") String timetableId);

        @Modifying
        @Transactional
        void deleteByDayId(String dayId);

        @Modifying
        @Transactional
        void deleteByBlockId(String blockId);
}
