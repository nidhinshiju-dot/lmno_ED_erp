package com.schoolerp.core.service;

import com.schoolerp.core.entity.WorkingDay;
import com.schoolerp.core.entity.PeriodBlock;
import com.schoolerp.core.repository.WorkingDayRepository;
import com.schoolerp.core.repository.PeriodBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleConfigService {

    private final WorkingDayRepository workingDayRepository;
    private final PeriodBlockRepository periodBlockRepository;
    private final com.schoolerp.core.repository.ClassTimetableRepository classTimetableRepository;
    private final com.schoolerp.core.repository.TeacherScheduleRepository teacherScheduleRepository;
    private final com.schoolerp.core.repository.TeacherAvailabilityRepository teacherAvailabilityRepository;
    private final com.schoolerp.core.repository.SubstitutionRepository substitutionRepository;
    private final com.schoolerp.core.repository.TimetableRepository timetableRepository;

    // ── Working Days ────────────────────────────────────────────────────────

    public List<WorkingDay> getAllWorkingDays() {
        return workingDayRepository.findAllByOrderByDayOrderAsc();
    }

    public WorkingDay saveWorkingDay(WorkingDay day) {
        return workingDayRepository.save(day);
    }

    public WorkingDay toggleDay(String id, boolean active) {
        return workingDayRepository.findById(id).map(d -> {
            if (!active) {
                String dayPrefix = d.getDayName().substring(0, 3).toUpperCase();
                if (timetableRepository.existsByDay(dayPrefix)) {
                    throw new com.schoolerp.core.exception.DependencyConflictException("Cannot disable Working Day. Active timetable matrix entries are scheduled on this day.");
                }
            }
            d.setIsActive(active);
            return workingDayRepository.save(d);
        }).orElseThrow(() -> new RuntimeException("Working day not found"));
    }

    @Transactional
    public void deleteWorkingDay(String id) {
        workingDayRepository.findById(id).ifPresent(day -> {
            String dayPrefix = day.getDayName().substring(0, 3).toUpperCase();
            timetableRepository.deleteByDay(dayPrefix);
        });

        // Cascade delete dependent timetable slots
        classTimetableRepository.deleteByDayId(id);
        teacherScheduleRepository.deleteByDayId(id);
        teacherAvailabilityRepository.deleteByDayId(id);

        workingDayRepository.deleteById(id);
    }

    public List<WorkingDay> getActiveWorkingDays() {
        return workingDayRepository.findByIsActiveTrueOrderByDayOrderAsc();
    }

    // ── Period Blocks ────────────────────────────────────────────────────────

    public List<PeriodBlock> getAllPeriodBlocks() {
        return periodBlockRepository.findAllByOrderByOrderIndexAsc();
    }

    public List<PeriodBlock> getPeriodBlocksOnly() {
        return periodBlockRepository.findByBlockTypeOrderByOrderIndexAsc("PERIOD");
    }

    public PeriodBlock savePeriodBlock(PeriodBlock block) {
        return periodBlockRepository.save(block);
    }

    public PeriodBlock updatePeriodBlock(String id, PeriodBlock updated) {
        return periodBlockRepository.findById(id).map(b -> {
            if (!b.getBlockType().equals(updated.getBlockType()) || !b.getOrderIndex().equals(updated.getOrderIndex())) {
                if (timetableRepository.existsByPeriod(b.getOrderIndex())) {
                    throw new com.schoolerp.core.exception.DependencyConflictException("Cannot modify Period index or type. It is locked by active timetable entries. Clear the timetable slots first.");
                }
            }
            b.setBlockName(updated.getBlockName());
            b.setBlockType(updated.getBlockType());
            b.setStartTime(updated.getStartTime());
            b.setEndTime(updated.getEndTime());
            b.setOrderIndex(updated.getOrderIndex());
            return periodBlockRepository.save(b);
        }).orElseThrow(() -> new RuntimeException("Period block not found"));
    }

    @Transactional
    public void deletePeriodBlock(String id) {
        periodBlockRepository.findById(id).ifPresent(block -> {
            timetableRepository.deleteByPeriod(block.getOrderIndex());
        });

        // Cascade delete dependent timetable slots
        classTimetableRepository.deleteByBlockId(id);
        teacherScheduleRepository.deleteByBlockId(id);
        teacherAvailabilityRepository.deleteByBlockId(id);
        substitutionRepository.deleteByBlockId(id);

        periodBlockRepository.deleteById(id);
    }
}
