package com.schoolerp.core.service;

import com.schoolerp.core.dto.GenerationResultDto;
import com.schoolerp.core.entity.*;
import com.schoolerp.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Constraint-based timetable generator.
 *
 * Algorithm:
 * 1. Load all ClassSubjectTeacher assignments for the school.
 * 2. Expand each into N slot requirements (periodsPerWeek).
 * 3. Shuffle for randomness.
 * 4. For each requirement, iterate over days × period_blocks.
 * 5. Check all 4 constraints (teacher, class, room, availability).
 * 6. Assign on first valid combination.
 * 7. Collect unscheduled requirements as conflicts.
 */
@Service
@RequiredArgsConstructor
public class TimetableGeneratorEngine {

    private final ClassSubjectTeacherRepository cstRepository;
    private final WorkingDayRepository workingDayRepository;
    private final PeriodBlockRepository periodBlockRepository;
    private final ClassTimetableRepository classTimetableRepository;
    private final TeacherScheduleRepository teacherScheduleRepository;
    private final TeacherAvailabilityRepository availabilityRepository;
    private final RoomRepository roomRepository;
    private final SubjectRoomRequirementRepository roomRequirementRepository;

    @Transactional
    public GenerationResultDto generate(String timetableId) {
        try {
            // Clear existing unlocked slots
            classTimetableRepository.deleteUnlockedByTimetableId(timetableId);
            teacherScheduleRepository.deleteByTimetableId(timetableId);

            List<WorkingDay> activeDays = workingDayRepository.findByIsActiveTrueOrderByDayOrderAsc();
            List<PeriodBlock> periodBlocks = periodBlockRepository.findByBlockTypeOrderByOrderIndexAsc("PERIOD");

            if (activeDays.isEmpty() || periodBlocks.isEmpty()) {
                return new GenerationResultDto(false, 0, 0,
                        List.of("No active working days or period blocks configured."),
                        "Configuration incomplete");
            }

            List<ClassSubjectTeacher> assignments = cstRepository.findAll();

            // Build slot requirements: expand periodsPerWeek
            List<ClassSubjectTeacher> slotRequirements = new ArrayList<>();
            for (ClassSubjectTeacher cst : assignments) {
                for (int i = 0; i < cst.getPeriodsPerWeek(); i++) {
                    slotRequirements.add(cst);
                }
            }

            // Shuffle for randomized placement
            Collections.shuffle(slotRequirements);

            // Build in-memory availability sets for speed
            Set<String> teacherBusySet = new HashSet<>(); // timetableId+teacherId+dayId+blockId
            Set<String> classBusySet = new HashSet<>(); // timetableId+classId+dayId+blockId
            Set<String> roomBusySet = new HashSet<>(); // timetableId+roomId+dayId+blockId
            Map<String, Set<String>> teacherUnavailable = buildUnavailabilityMap();

            List<String> conflicts = new ArrayList<>();
            int scheduled = 0;

            for (ClassSubjectTeacher req : slotRequirements) {
                boolean placed = false;

                List<WorkingDay> shuffledDays = new ArrayList<>(activeDays);
                Collections.shuffle(shuffledDays);

                for (WorkingDay day : shuffledDays) {
                    List<PeriodBlock> shuffledBlocks = new ArrayList<>(periodBlocks);
                    Collections.shuffle(shuffledBlocks);

                    for (PeriodBlock block : shuffledBlocks) {
                        String teacherKey = key(timetableId, req.getTeacherId(), day.getId(), block.getId());
                        String classKey = key(timetableId, req.getClassId(), day.getId(), block.getId());

                        // Check teacher busy
                        if (teacherBusySet.contains(teacherKey))
                            continue;
                        // Check class busy
                        if (classBusySet.contains(classKey))
                            continue;
                        // Check teacher availability
                        String unavailKey = req.getTeacherId() + "|" + day.getId() + "|" + block.getId();
                        if (teacherUnavailable.getOrDefault(req.getTeacherId(), Collections.emptySet())
                                .contains(unavailKey)) {
                            continue;
                        }

                        // Assign room
                        String assignedRoomId = findRoom(req.getSubjectId(), timetableId, day.getId(), block.getId(),
                                roomBusySet);

                        // Create slot
                        ClassTimetable slot = new ClassTimetable();
                        slot.setTimetableId(timetableId);
                        slot.setClassId(req.getClassId());
                        slot.setDayId(day.getId());
                        slot.setBlockId(block.getId());
                        slot.setClassSubjectTeacherId(req.getId());
                        slot.setRoomId(assignedRoomId);
                        slot.setIsLocked(false);
                        classTimetableRepository.save(slot);

                        // Create denormalized teacher schedule
                        TeacherSchedule ts = new TeacherSchedule();
                        ts.setTimetableId(timetableId);
                        ts.setTeacherId(req.getTeacherId());
                        ts.setDayId(day.getId());
                        ts.setBlockId(block.getId());
                        ts.setClassId(req.getClassId());
                        ts.setSubjectId(req.getSubjectId());
                        ts.setRoomId(assignedRoomId);
                        teacherScheduleRepository.save(ts);

                        // Mark busy
                        teacherBusySet.add(teacherKey);
                        classBusySet.add(classKey);
                        if (assignedRoomId != null) {
                            roomBusySet.add(key(timetableId, assignedRoomId, day.getId(), block.getId()));
                        }

                        placed = true;
                        scheduled++;
                        break;
                    }
                    if (placed)
                        break;
                }

                if (!placed) {
                    conflicts.add("Could not schedule: ClassId=" + req.getClassId()
                            + " SubjectId=" + req.getSubjectId()
                            + " TeacherId=" + req.getTeacherId()
                            + " (no available slot found)");
                }
            }

            boolean success = conflicts.isEmpty();
            String message = success
                    ? "Timetable generated successfully. " + scheduled + " slots scheduled."
                    : "Timetable generated with " + conflicts.size() + " unresolved conflicts.";

            return new GenerationResultDto(success, scheduled, slotRequirements.size(), conflicts, message);
        } catch (Exception e) {
            e.printStackTrace();
            return new GenerationResultDto(false, 0, 0,
                    List.of(e.getMessage() != null ? e.getMessage() : "Unknown Error"), "Critical Generation Error");
        }
    }

    private String key(String... parts) {
        return String.join("|", parts);
    }

    private Map<String, Set<String>> buildUnavailabilityMap() {
        Map<String, Set<String>> map = new HashMap<>();
        availabilityRepository.findAll().forEach(av -> {
            if (Boolean.FALSE.equals(av.getIsAvailable())) {
                map.computeIfAbsent(av.getTeacherId(), k -> new HashSet<>())
                        .add(av.getTeacherId() + "|" + av.getDayId() + "|" + av.getBlockId());
            }
        });
        return map;
    }

    private String findRoom(String subjectId, String timetableId, String dayId, String blockId,
            Set<String> roomBusySet) {
        Optional<String> requiredType = roomRequirementRepository
                .findBySubjectIdAndIsRequiredTrue(subjectId)
                .map(r -> r.getRoomTypeId());

        List<Room> candidates;
        if (requiredType.isPresent()) {
            candidates = roomRepository.findByRoomTypeIdAndIsActiveTrue(requiredType.get());
        } else {
            candidates = roomRepository.findByIsActiveTrueOrderByRoomNameAsc();
        }

        for (Room room : candidates) {
            String roomKey = key(timetableId, room.getId(), dayId, blockId);
            if (!roomBusySet.contains(roomKey)) {
                return room.getId();
            }
        }
        return null; // No room available (non-fatal)
    }
}
