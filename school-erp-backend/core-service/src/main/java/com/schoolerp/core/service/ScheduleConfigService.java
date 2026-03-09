package com.schoolerp.core.service;

import com.schoolerp.core.entity.WorkingDay;
import com.schoolerp.core.entity.PeriodBlock;
import com.schoolerp.core.repository.WorkingDayRepository;
import com.schoolerp.core.repository.PeriodBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleConfigService {

    private final WorkingDayRepository workingDayRepository;
    private final PeriodBlockRepository periodBlockRepository;
    private final com.schoolerp.core.repository.ClassTimetableRepository classTimetableRepository;
    private final com.schoolerp.core.repository.TeacherScheduleRepository teacherScheduleRepository;

    // ── Working Days ────────────────────────────────────────────────────────

    public List<WorkingDay> getAllWorkingDays() {
        return workingDayRepository.findAllByOrderByDayOrderAsc();
    }

    public WorkingDay saveWorkingDay(WorkingDay day) {
        return workingDayRepository.save(day);
    }

    public WorkingDay toggleDay(String id, boolean active) {
        return workingDayRepository.findById(id).map(d -> {
            d.setIsActive(active);
            return workingDayRepository.save(d);
        }).orElseThrow(() -> new RuntimeException("Working day not found"));
    }

    public void deleteWorkingDay(String id) {
        // Cascade delete dependent timetable slots
        classTimetableRepository.deleteByDayId(id);
        teacherScheduleRepository.deleteByDayId(id);

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
            b.setBlockName(updated.getBlockName());
            b.setBlockType(updated.getBlockType());
            b.setStartTime(updated.getStartTime());
            b.setEndTime(updated.getEndTime());
            b.setOrderIndex(updated.getOrderIndex());
            return periodBlockRepository.save(b);
        }).orElseThrow(() -> new RuntimeException("Period block not found"));
    }

    public void deletePeriodBlock(String id) {
        // Cascade delete dependent timetable slots
        classTimetableRepository.deleteByBlockId(id);
        teacherScheduleRepository.deleteByBlockId(id);

        periodBlockRepository.deleteById(id);
    }
}
