package com.schoolerp.core.service;

import com.schoolerp.core.repository.ClassTimetableRepository;
import com.schoolerp.core.repository.TeacherScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Stateless conflict detection service.
 * All checks are pure DB lookups — safe to call from any context.
 */
@Service
@RequiredArgsConstructor
public class ConflictDetectionService {

    private final ClassTimetableRepository classTimetableRepository;
    private final TeacherScheduleRepository teacherScheduleRepository;

    /**
     * True if the teacher is already scheduled in this timetable at this day+block.
     */
    public boolean isTeacherBusy(String timetableId, String teacherId, String dayId, String blockId) {
        return teacherScheduleRepository.existsByTimetableIdAndTeacherIdAndDayIdAndBlockId(
                timetableId, teacherId, dayId, blockId);
    }

    /**
     * True if the class already has a subject scheduled at this day+block.
     */
    public boolean isClassBusy(String timetableId, String classId, String dayId, String blockId) {
        return classTimetableRepository.existsByTimetableIdAndClassIdAndDayIdAndBlockId(
                timetableId, classId, dayId, blockId);
    }

    /**
     * True if the room is already in use at this day+block (across all classes).
     */
    public boolean isRoomBusy(String timetableId, String roomId, String dayId, String blockId) {
        if (roomId == null)
            return false;
        return classTimetableRepository.existsByTimetableIdAndRoomIdAndDayIdAndBlockId(
                timetableId, roomId, dayId, blockId);
    }

    /**
     * Returns a list of conflict descriptions for a proposed slot assignment.
     */
    public List<String> detectConflicts(
            String timetableId, String classId, String teacherId,
            String roomId, String dayId, String blockId,
            String teacherName, String className, String roomName,
            String dayName, String blockName) {

        List<String> conflicts = new ArrayList<>();

        if (isTeacherBusy(timetableId, teacherId, dayId, blockId)) {
            conflicts.add("Teacher '" + teacherName + "' is already assigned on " + dayName + " " + blockName);
        }
        if (isClassBusy(timetableId, classId, dayId, blockId)) {
            conflicts.add("Class '" + className + "' already has a subject scheduled on " + dayName + " " + blockName);
        }
        if (roomId != null && isRoomBusy(timetableId, roomId, dayId, blockId)) {
            conflicts.add("Room '" + roomName + "' is already booked on " + dayName + " " + blockName);
        }

        return conflicts;
    }
}
