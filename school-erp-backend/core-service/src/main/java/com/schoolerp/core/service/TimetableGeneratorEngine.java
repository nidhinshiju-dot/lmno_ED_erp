package com.schoolerp.core.service;

import com.schoolerp.core.dto.GenerationResultDto;
import com.schoolerp.core.entity.*;
import com.schoolerp.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import java.util.stream.Collectors;

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
    private final SubjectLabGroupRequirementRepository subjectLabGroupRequirementRepository;
    private final LabGroupRoomRepository labGroupRoomRepository;
    private final StaffRepository staffRepository;
    private final SchoolClassRepository classRepository;

    @Transactional
    public GenerationResultDto generate(String timetableId, boolean isClassTeacherFirstPeriod) {
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
            Map<String, Staff> staffMap = staffRepository.findAll().stream().collect(Collectors.toMap(Staff::getId, s -> s));

            // Validate teacher workloads
            Map<String, Integer> teacherAllocatedPeriods = new HashMap<>();
            for (ClassSubjectTeacher cst : assignments) {
                teacherAllocatedPeriods.put(cst.getTeacherId(), teacherAllocatedPeriods.getOrDefault(cst.getTeacherId(), 0) + cst.getPeriodsPerWeek());
            }

            for (Map.Entry<String, Integer> entry : teacherAllocatedPeriods.entrySet()) {
                Staff staff = staffMap.get(entry.getKey());
                if (staff != null && staff.getMaxPeriods() != null && entry.getValue() > staff.getMaxPeriods()) {
                    return new GenerationResultDto(false, 0, 0,
                            List.of("Teacher " + staff.getName() + " workload exceeded: assigned " + entry.getValue() + " but max is " + staff.getMaxPeriods()),
                            "Workload Validation Failed");
                }
            }

            // Group assignments by classId + subjectId
            Map<String, List<ClassSubjectTeacher>> groupedAssignments = new HashMap<>();
            for (ClassSubjectTeacher cst : assignments) {
                String key = cst.getClassId() + "|" + cst.getSubjectId();
                groupedAssignments.computeIfAbsent(key, k -> new ArrayList<>()).add(cst);
            }

            // Build slot requirements
            List<List<ClassSubjectTeacher>> slotRequirements = new ArrayList<>();
            int totalExpectedSlots = 0;

            for (List<ClassSubjectTeacher> group : groupedAssignments.values()) {
                if (group.isEmpty()) continue;
                ClassSubjectTeacher primary = group.get(0);
                int blocksNum = primary.getConsecutiveBlocks() != null && primary.getConsecutiveBlocks() > 0 ? primary.getConsecutiveBlocks() : 1;
                int sessions = (int) Math.ceil((double) primary.getPeriodsPerWeek() / blocksNum);
                
                if (Boolean.TRUE.equals(primary.getIsLab())) {
                    sessions = 1;
                    totalExpectedSlots += blocksNum;
                } else {
                    totalExpectedSlots += primary.getPeriodsPerWeek();
                }

                for (int i = 0; i < sessions; i++) {
                    slotRequirements.add(group);
                }
            }

            Collections.shuffle(slotRequirements);

            Set<String> teacherBusySet = new HashSet<>();
            Set<String> classBusySet = new HashSet<>();
            Set<String> roomBusySet = new HashSet<>();
            Map<String, Set<String>> teacherUnavailable = buildUnavailabilityMap();

            List<String> conflicts = new ArrayList<>();
            int scheduled = 0;

            // Class Teacher First Period Logic
            if (isClassTeacherFirstPeriod && !periodBlocks.isEmpty()) {
                PeriodBlock firstPeriod = periodBlocks.get(0);
                Map<String, SchoolClass> classMap = classRepository.findAll().stream().collect(Collectors.toMap(SchoolClass::getId, c -> c));

                for (SchoolClass sc : classMap.values()) {
                    if (sc.getClassTeacherId() == null) continue;
                    
                    // Find the subject(s) this teacher teaches for this class
                    List<ClassSubjectTeacher> teacherSubjectsForClass = assignments.stream()
                        .filter(a -> a.getClassId().equals(sc.getId()) && a.getTeacherId().equals(sc.getClassTeacherId()) && (a.getIsLab() == null || !a.getIsLab()))
                        .collect(Collectors.toList());
                    
                    if (teacherSubjectsForClass.isEmpty()) continue;

                    // Group by subjectId. For simplicity, pick the first lecture subject they teach.
                    ClassSubjectTeacher cstToAssign = teacherSubjectsForClass.get(0);
                    List<ClassSubjectTeacher> groupToAssign = groupedAssignments.get(cstToAssign.getClassId() + "|" + cstToAssign.getSubjectId());
                    
                    for (WorkingDay day : activeDays) {
                        String dayBlockKey = day.getId() + "-" + firstPeriod.getId();
                        String classKey = sc.getId() + "-" + dayBlockKey;
                        String teacherKey = sc.getClassTeacherId() + "-" + dayBlockKey;

                        if (!classBusySet.contains(classKey) && !teacherBusySet.contains(teacherKey) && 
                            (!teacherUnavailable.containsKey(sc.getClassTeacherId()) || !teacherUnavailable.get(sc.getClassTeacherId()).contains(day.getId() + "-" + firstPeriod.getId()))) {
                            
                            // Check if this group has remaining sessions in slotRequirements
                            boolean removed = slotRequirements.remove(groupToAssign);
                            if (removed) {
                                // Assign it!
                                for (ClassSubjectTeacher t : groupToAssign) {
                                    ClassTimetable ct = new ClassTimetable();
                                    ct.setTimetableId(timetableId);
                                    ct.setClassId(t.getClassId());
                                    ct.setDayId(day.getId());
                                    ct.setBlockId(firstPeriod.getId());
                                    ct.setClassSubjectTeacherId(t.getId());
                                    ct.setIsLocked(false);
                                    classTimetableRepository.save(ct);

                                    TeacherSchedule ts = new TeacherSchedule();
                                    ts.setTimetableId(timetableId);
                                    ts.setTeacherId(t.getTeacherId());
                                    ts.setDayId(day.getId());
                                    ts.setBlockId(firstPeriod.getId());
                                    ts.setClassId(t.getClassId());
                                    ts.setSubjectId(t.getSubjectId());
                                    teacherScheduleRepository.save(ts);
                                    
                                    teacherBusySet.add(t.getTeacherId() + "-" + dayBlockKey);
                                }
                                classBusySet.add(classKey);
                                scheduled += 1;
                            } else {
                                // No more sessions left for this subject, break out of day loop for this class teacher
                                break;
                            }
                        }
                    }
                }
            }

            for (List<ClassSubjectTeacher> reqGroup : slotRequirements) {
                ClassSubjectTeacher primary = reqGroup.get(0);
                boolean placed = false;

                List<WorkingDay> shuffledDays = new ArrayList<>(activeDays);
                Collections.shuffle(shuffledDays);

                for (WorkingDay day : shuffledDays) {
                    int consec = primary.getConsecutiveBlocks() != null && primary.getConsecutiveBlocks() > 0 ? primary.getConsecutiveBlocks() : 1;
                    
                    List<Integer> startIndices = new ArrayList<>();
                    for (int i = 0; i <= periodBlocks.size() - consec; i++) {
                        startIndices.add(i);
                    }
                    Collections.shuffle(startIndices);

                    List<Integer> strictIndices = new ArrayList<>();
                    List<Integer> relaxedIndices = new ArrayList<>();
                    for (int startIndex : startIndices) {
                        boolean isStrict = true;
                        if (consec > 1) {
                            for (int k = 0; k < consec - 1; k++) {
                                PeriodBlock curr = periodBlocks.get(startIndex + k);
                                PeriodBlock next = periodBlocks.get(startIndex + k + 1);
                                if (next.getOrderIndex() - curr.getOrderIndex() > 1) {
                                    isStrict = false;
                                    break;
                                }
                            }
                        }
                        if (isStrict) strictIndices.add(startIndex);
                        else relaxedIndices.add(startIndex);
                    }

                    List<Integer> prioritizedIndices = new ArrayList<>(strictIndices);
                    prioritizedIndices.addAll(relaxedIndices);

                    for (int startIndex : prioritizedIndices) {
                        List<PeriodBlock> window = periodBlocks.subList(startIndex, startIndex + consec);
                        boolean windowValid = true;

                        // Check teacher availability & conflicts for the entire window for ALL teachers in group
                        for (PeriodBlock block : window) {
                            String classKey = key(timetableId, primary.getClassId(), day.getId(), block.getId());
                            if (classBusySet.contains(classKey)) {
                                windowValid = false;
                                break;
                            }
                            for (ClassSubjectTeacher tReq : reqGroup) {
                                String teacherKey = key(timetableId, tReq.getTeacherId(), day.getId(), block.getId());
                                String unavailKey = tReq.getTeacherId() + "|" + day.getId() + "|" + block.getId();
                                if (teacherBusySet.contains(teacherKey) || teacherUnavailable.getOrDefault(tReq.getTeacherId(), Collections.emptySet()).contains(unavailKey)) {
                                    windowValid = false;
                                    break;
                                }
                            }
                            if (!windowValid) break;
                        }

                        List<String> assignedRoomIds = new ArrayList<>();
                        if (windowValid) {
                            assignedRoomIds = findRoomsForWindow(primary.getSubjectId(), timetableId, day.getId(), window, roomBusySet);
                            
                            boolean requiresRoomType = roomRequirementRepository.findBySubjectIdAndIsRequiredTrue(primary.getSubjectId()).isPresent();
                            boolean requiresLabGroup = subjectLabGroupRequirementRepository.findBySubjectId(primary.getSubjectId()).isPresent();
                            
                            if ((requiresRoomType || requiresLabGroup) && assignedRoomIds.isEmpty()) {
                                windowValid = false;
                            }
                        }

                        if (windowValid) {
                            for (PeriodBlock block : window) {
                                List<String> loopRoomIds = assignedRoomIds.isEmpty() ? Collections.singletonList((String) null) : assignedRoomIds;
                                
                                int maxIterations = Math.max(loopRoomIds.size(), reqGroup.size());
                                
                                for (int i = 0; i < maxIterations; i++) {
                                    String rid = loopRoomIds.get(Math.min(i, loopRoomIds.size() - 1));
                                    ClassSubjectTeacher mappedTeacher = reqGroup.get(Math.min(i, reqGroup.size() - 1));

                                    ClassTimetable slot = new ClassTimetable();
                                    slot.setTimetableId(timetableId);
                                    slot.setClassId(mappedTeacher.getClassId());
                                    slot.setDayId(day.getId());
                                    slot.setBlockId(block.getId());
                                    slot.setClassSubjectTeacherId(mappedTeacher.getId());
                                    slot.setRoomId(rid);
                                    slot.setIsLocked(false);
                                    classTimetableRepository.save(slot);

                                    TeacherSchedule ts = new TeacherSchedule();
                                    ts.setTimetableId(timetableId);
                                    ts.setTeacherId(mappedTeacher.getTeacherId());
                                    ts.setDayId(day.getId());
                                    ts.setBlockId(block.getId());
                                    ts.setClassId(mappedTeacher.getClassId());
                                    ts.setSubjectId(mappedTeacher.getSubjectId());
                                    ts.setRoomId(rid);
                                    teacherScheduleRepository.save(ts);

                                    if (rid != null) {
                                        roomBusySet.add(key(timetableId, rid, day.getId(), block.getId()));
                                    }
                                    teacherBusySet.add(key(timetableId, mappedTeacher.getTeacherId(), day.getId(), block.getId()));
                                }

                                classBusySet.add(key(timetableId, primary.getClassId(), day.getId(), block.getId()));
                                scheduled++;
                            }
                            placed = true;
                            break;
                        }
                    }
                    if (placed)
                        break;
                }

                if (!placed) {
                    conflicts.add("Could not schedule: ClassId=" + primary.getClassId() +
                            " SubjectId=" + primary.getSubjectId() +
                            " TeacherId=" + primary.getTeacherId() +
                            " (no available slot found)");
                }
            }

            String msg = conflicts.isEmpty() ? "Timetable generated successfully" : "Timetable generated with " + conflicts.size() + " unresolved conflicts.";
            return new GenerationResultDto(conflicts.isEmpty(), totalExpectedSlots, scheduled, conflicts, msg);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new GenerationResultDto(false, 0, 0, List.of(e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()), "Generation failed due to system error: " + (e.getMessage() != null ? e.getMessage() : "Unknown"));
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

    private List<String> findRoomsForWindow(String subjectId, String timetableId, String dayId, List<PeriodBlock> window, Set<String> roomBusySet) {
        
        // 1. Check if it's a Batch Rotation Lab Group requirement
        Optional<SubjectLabGroupRequirement> labGroupReq = subjectLabGroupRequirementRepository.findBySubjectId(subjectId);
        if (labGroupReq.isPresent()) {
            List<LabGroupRoom> groupRooms = labGroupRoomRepository.findByLabGroupId(labGroupReq.get().getLabGroupId());
            if (groupRooms.isEmpty()) return Collections.emptyList();
            
            // For a Lab Group, EVERY room in the group MUST be available simultaneously
            boolean allRoomsAvailable = true;
            List<String> roomIds = new ArrayList<>();
            for (LabGroupRoom lgr : groupRooms) {
                roomIds.add(lgr.getRoomId());
                for (PeriodBlock block : window) {
                    String roomKey = key(timetableId, lgr.getRoomId(), dayId, block.getId());
                    if (roomBusySet.contains(roomKey)) {
                        allRoomsAvailable = false;
                        break;
                    }
                }
                if (!allRoomsAvailable) break;
            }
            if (allRoomsAvailable) {
                return roomIds;
            }
            return Collections.emptyList(); // If even one room in the group is busy, the whole group is unavailable
        }

        // 2. Check standard single Room Type requirement
        Optional<String> requiredType = roomRequirementRepository
                .findBySubjectIdAndIsRequiredTrue(subjectId)
                .map(r -> r.getRoomTypeId());

        if (requiredType.isEmpty()) {
            return Collections.emptyList();
        }

        List<Room> candidates = roomRepository.findByRoomTypeIdAndIsActiveTrue(requiredType.get());

        for (Room room : candidates) {
            boolean isRoomValid = true;
            for (PeriodBlock block : window) {
                String roomKey = key(timetableId, room.getId(), dayId, block.getId());
                if (roomBusySet.contains(roomKey)) {
                    isRoomValid = false;
                    break;
                }
            }
            if (isRoomValid) {
                return Collections.singletonList(room.getId());
            }
        }
        return Collections.emptyList();
    }
}
