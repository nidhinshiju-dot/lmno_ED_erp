package com.schoolerp.core.service;

import com.schoolerp.core.dto.TimetableSlotDto;
import com.schoolerp.core.entity.*;
import com.schoolerp.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableHeaderRepository timetableHeaderRepository;
    private final ClassTimetableRepository classTimetableRepository;
    private final TeacherScheduleRepository teacherScheduleRepository;
    private final ClassSubjectTeacherRepository cstRepository;
    private final WorkingDayRepository workingDayRepository;
    private final PeriodBlockRepository periodBlockRepository;
    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final RoomRepository roomRepository;
    private final ConflictDetectionService conflictDetectionService;

    // ── Timetable Header CRUD ────────────────────────────────────────────────

    public List<Timetable> getAllTimetables() {
        return timetableHeaderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Timetable createTimetable(Timetable t) {
        return timetableHeaderRepository.save(t);
    }

    public Timetable publishTimetable(String id) {
        return timetableHeaderRepository.findById(id).map(t -> {
            t.setStatus("PUBLISHED");
            return timetableHeaderRepository.save(t);
        }).orElseThrow(() -> new RuntimeException("Timetable not found: " + id));
    }

    public void deleteTimetable(String id) {
        timetableHeaderRepository.deleteById(id);
    }

    // ── Slot Queries (with DTO enrichment) ───────────────────────────────────

    public List<TimetableSlotDto> getSlotsForClass(String timetableId, String classId) {
        List<ClassTimetable> slots = classTimetableRepository.findByTimetableIdAndClassId(timetableId, classId);
        return enrichSlots(slots);
    }

    public List<TimetableSlotDto> getSlotsForTimetable(String timetableId) {
        List<ClassTimetable> slots = classTimetableRepository.findByTimetableId(timetableId);
        return enrichSlots(slots);
    }

    public List<TimetableSlotDto> getSlotsForTeacher(String timetableId, String teacherId) {
        List<TeacherSchedule> schedules = teacherScheduleRepository.findByTimetableIdAndTeacherId(timetableId,
                teacherId);
        // Map teacher schedule back to enriched slot view
        return schedules.stream().map(ts -> {
            TimetableSlotDto dto = new TimetableSlotDto();
            dto.setClassId(ts.getClassId());
            dto.setDayId(ts.getDayId());
            dto.setBlockId(ts.getBlockId());
            dto.setTeacherId(ts.getTeacherId());
            dto.setSubjectId(ts.getSubjectId());
            dto.setRoomId(ts.getRoomId());
            enrichTeacher(dto);
            enrichClass(dto);
            enrichDay(dto);
            enrichBlock(dto);
            enrichSubject(dto);
            enrichRoom(dto);
            return dto;
        }).collect(Collectors.toList());
    }

    // ── Manual Slot Edit ─────────────────────────────────────────────────────

    @Transactional
    public TimetableSlotDto updateSlot(String slotId, String classSubjectTeacherId, String roomId) {
        ClassTimetable slot = classTimetableRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));

        if (Boolean.TRUE.equals(slot.getIsLocked())) {
            throw new RuntimeException("This slot is locked and cannot be edited.");
        }

        ClassSubjectTeacher cst = cstRepository.findById(classSubjectTeacherId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + classSubjectTeacherId));

        // Conflict check — exclude current slot's teacher from the check
        if (!cst.getTeacherId().equals(getTeacherForSlot(slot))) {
            if (conflictDetectionService.isTeacherBusy(slot.getTimetableId(), cst.getTeacherId(),
                    slot.getDayId(), slot.getBlockId())) {
                throw new RuntimeException("Teacher conflict: teacher already scheduled at this time.");
            }
        }

        // Remove old teacher schedule entry
        teacherScheduleRepository.findByTimetableIdAndTeacherIdAndDayIdAndBlockId(
                slot.getTimetableId(), getTeacherForSlot(slot), slot.getDayId(), slot.getBlockId())
                .ifPresent(teacherScheduleRepository::delete);

        slot.setClassSubjectTeacherId(classSubjectTeacherId);
        slot.setRoomId(roomId);
        classTimetableRepository.save(slot);

        // Write new teacher schedule entry
        TeacherSchedule ts = new TeacherSchedule();
        ts.setTimetableId(slot.getTimetableId());
        ts.setTeacherId(cst.getTeacherId());
        ts.setDayId(slot.getDayId());
        ts.setBlockId(slot.getBlockId());
        ts.setClassId(slot.getClassId());
        ts.setSubjectId(cst.getSubjectId());
        ts.setRoomId(roomId);
        teacherScheduleRepository.save(ts);

        return enrichSlots(List.of(slot)).get(0);
    }

    @Transactional
    public void deleteSlot(String slotId) {
        ClassTimetable slot = classTimetableRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        if (Boolean.TRUE.equals(slot.getIsLocked())) {
            throw new RuntimeException("Slot is locked — unlock it before deleting.");
        }
        // Remove associated teacher schedule entry
        teacherScheduleRepository.findByTimetableIdAndTeacherIdAndDayIdAndBlockId(
                slot.getTimetableId(), getTeacherForSlot(slot), slot.getDayId(), slot.getBlockId())
                .ifPresent(teacherScheduleRepository::delete);
        classTimetableRepository.deleteById(slotId);
    }

    @Transactional
    public TimetableSlotDto createSlot(String timetableId, String classId, String dayId, String blockId,
            String classSubjectTeacherId, String roomId) {
        // Ensure no duplicate slot exists for this class/day/block
        List<ClassTimetable> existing = classTimetableRepository.findByTimetableId(timetableId);
        boolean duplicate = existing.stream().anyMatch(
                s -> s.getClassId().equals(classId) && s.getDayId().equals(dayId) && s.getBlockId().equals(blockId));
        if (duplicate) {
            throw new RuntimeException("A slot already exists for this class at this day/block.");
        }

        ClassSubjectTeacher cst = cstRepository.findById(classSubjectTeacherId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + classSubjectTeacherId));

        // Teacher conflict check
        if (conflictDetectionService.isTeacherBusy(timetableId, cst.getTeacherId(), dayId, blockId)) {
            throw new RuntimeException("Teacher conflict: teacher already scheduled at this time.");
        }

        ClassTimetable slot = new ClassTimetable();
        slot.setTimetableId(timetableId);
        slot.setClassId(classId);
        slot.setDayId(dayId);
        slot.setBlockId(blockId);
        slot.setClassSubjectTeacherId(classSubjectTeacherId);
        slot.setRoomId(roomId);
        slot.setIsLocked(false);
        classTimetableRepository.save(slot);

        // Write teacher schedule entry
        TeacherSchedule ts = new TeacherSchedule();
        ts.setTimetableId(timetableId);
        ts.setTeacherId(cst.getTeacherId());
        ts.setDayId(dayId);
        ts.setBlockId(blockId);
        ts.setClassId(classId);
        ts.setSubjectId(cst.getSubjectId());
        ts.setRoomId(roomId);
        teacherScheduleRepository.save(ts);

        return enrichSlots(List.of(slot)).get(0);
    }

    @Transactional
    public ClassTimetable toggleLock(String slotId) {
        return classTimetableRepository.findById(slotId).map(s -> {
            s.setIsLocked(!Boolean.TRUE.equals(s.getIsLocked()));
            return classTimetableRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String getTeacherForSlot(ClassTimetable slot) {
        return cstRepository.findById(slot.getClassSubjectTeacherId())
                .map(ClassSubjectTeacher::getTeacherId).orElse(null);
    }

    private List<TimetableSlotDto> enrichSlots(List<ClassTimetable> slots) {
        // Pre-fetch all referenced IDs to avoid N+1
        Set<String> cstIds = slots.stream().map(ClassTimetable::getClassSubjectTeacherId).collect(Collectors.toSet());
        Map<String, ClassSubjectTeacher> cstMap = cstRepository.findAllById(cstIds).stream()
                .collect(Collectors.toMap(ClassSubjectTeacher::getId, Function.identity()));

        Set<String> subjectIds = cstMap.values().stream().map(ClassSubjectTeacher::getSubjectId)
                .collect(Collectors.toSet());
        Map<String, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));

        Set<String> teacherIds = cstMap.values().stream().map(ClassSubjectTeacher::getTeacherId)
                .collect(Collectors.toSet());
        Map<String, Staff> staffMap = staffRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(Staff::getId, Function.identity()));

        Set<String> classIds = slots.stream().map(ClassTimetable::getClassId).collect(Collectors.toSet());
        Map<String, SchoolClass> classMap = schoolClassRepository.findAllById(classIds).stream()
                .collect(Collectors.toMap(SchoolClass::getId, Function.identity()));

        Set<String> dayIds = slots.stream().map(ClassTimetable::getDayId).collect(Collectors.toSet());
        Map<String, WorkingDay> dayMap = workingDayRepository.findAllById(dayIds).stream()
                .collect(Collectors.toMap(WorkingDay::getId, Function.identity()));

        Set<String> blockIds = slots.stream().map(ClassTimetable::getBlockId).collect(Collectors.toSet());
        Map<String, PeriodBlock> blockMap = periodBlockRepository.findAllById(blockIds).stream()
                .collect(Collectors.toMap(PeriodBlock::getId, Function.identity()));

        Set<String> roomIds = slots.stream()
                .map(ClassTimetable::getRoomId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<String, Room> roomMap = roomRepository.findAllById(roomIds).stream()
                .collect(Collectors.toMap(Room::getId, Function.identity()));

        return slots.stream().map(slot -> {
            TimetableSlotDto dto = new TimetableSlotDto();
            dto.setId(slot.getId());
            dto.setClassId(slot.getClassId());
            dto.setDayId(slot.getDayId());
            dto.setBlockId(slot.getBlockId());
            dto.setClassSubjectTeacherId(slot.getClassSubjectTeacherId());
            dto.setRoomId(slot.getRoomId());
            dto.setIsLocked(slot.getIsLocked());

            ClassSubjectTeacher cst = cstMap.get(slot.getClassSubjectTeacherId());
            if (cst != null) {
                dto.setTeacherId(cst.getTeacherId());
                dto.setSubjectId(cst.getSubjectId());
                Subject subj = subjectMap.get(cst.getSubjectId());
                if (subj != null)
                    dto.setSubjectName(subj.getName());
                Staff teacher = staffMap.get(cst.getTeacherId());
                if (teacher != null)
                    dto.setTeacherName(teacher.getName());
            }

            SchoolClass cls = classMap.get(slot.getClassId());
            if (cls != null)
                dto.setClassName(cls.getName());

            WorkingDay day = dayMap.get(slot.getDayId());
            if (day != null) {
                dto.setDayName(day.getDayName());
                dto.setDayOrder(day.getDayOrder());
            }

            PeriodBlock block = blockMap.get(slot.getBlockId());
            if (block != null) {
                dto.setBlockName(block.getBlockName());
                dto.setStartTime(block.getStartTime());
                dto.setEndTime(block.getEndTime());
            }

            if (slot.getRoomId() != null) {
                Room room = roomMap.get(slot.getRoomId());
                if (room != null)
                    dto.setRoomName(room.getRoomName());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // Lazy enrichment helpers for teacher-schedule-based queries
    private void enrichTeacher(TimetableSlotDto dto) {
        if (dto.getTeacherId() != null)
            staffRepository.findById(dto.getTeacherId()).ifPresent(s -> dto.setTeacherName(s.getName()));
    }

    private void enrichClass(TimetableSlotDto dto) {
        if (dto.getClassId() != null)
            schoolClassRepository.findById(dto.getClassId()).ifPresent(c -> dto.setClassName(c.getName()));
    }

    private void enrichDay(TimetableSlotDto dto) {
        if (dto.getDayId() != null)
            workingDayRepository.findById(dto.getDayId()).ifPresent(d -> {
                dto.setDayName(d.getDayName());
                dto.setDayOrder(d.getDayOrder());
            });
    }

    private void enrichBlock(TimetableSlotDto dto) {
        if (dto.getBlockId() != null)
            periodBlockRepository.findById(dto.getBlockId()).ifPresent(b -> {
                dto.setBlockName(b.getBlockName());
                dto.setStartTime(b.getStartTime());
                dto.setEndTime(b.getEndTime());
            });
    }

    private void enrichSubject(TimetableSlotDto dto) {
        if (dto.getSubjectId() != null)
            subjectRepository.findById(dto.getSubjectId()).ifPresent(s -> dto.setSubjectName(s.getName()));
    }

    private void enrichRoom(TimetableSlotDto dto) {
        if (dto.getRoomId() != null)
            roomRepository.findById(dto.getRoomId()).ifPresent(r -> dto.setRoomName(r.getRoomName()));
    }
}
