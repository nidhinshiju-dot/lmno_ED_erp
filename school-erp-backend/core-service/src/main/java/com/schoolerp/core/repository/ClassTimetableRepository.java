package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ClassTimetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ClassTimetableRepository extends JpaRepository<ClassTimetable, String> {
        List<ClassTimetable> findByTimetableId(String timetableId);

        List<ClassTimetable> findByTimetableIdAndClassId(String timetableId, String classId);

        Optional<ClassTimetable> findByTimetableIdAndClassIdAndDayIdAndBlockId(
                        String timetableId, String classId, String dayId, String blockId);

        boolean existsByTimetableIdAndClassIdAndDayIdAndBlockId(
                        String timetableId, String classId, String dayId, String blockId);

        boolean existsByTimetableIdAndRoomIdAndDayIdAndBlockId(
                        String timetableId, String roomId, String dayId, String blockId);

        List<ClassTimetable> findByTimetableIdAndDayId(String timetableId, String dayId);

        @Modifying
        @Transactional
        @Query("DELETE FROM ClassTimetable ct WHERE ct.timetableId = :timetableId AND ct.isLocked = false")
        void deleteUnlockedByTimetableId(@Param("timetableId") String timetableId);

        @Modifying
        @Transactional
        void deleteByDayId(String dayId);

        @Modifying
        @Transactional
        void deleteByBlockId(String blockId);
}
