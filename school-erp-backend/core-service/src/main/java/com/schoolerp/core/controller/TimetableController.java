package com.schoolerp.core.controller;

import com.schoolerp.core.dto.GenerationResultDto;
import com.schoolerp.core.dto.TimetableSlotDto;
import com.schoolerp.core.entity.ClassTimetable;
import com.schoolerp.core.entity.Timetable;
import com.schoolerp.core.service.TimetableGeneratorEngine;
import com.schoolerp.core.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;
    private final TimetableGeneratorEngine generatorEngine;

    // ── Timetable Header ──────────────────────────────────────────────────────

    @GetMapping
    public List<Timetable> getAll() {
        return timetableService.getAllTimetables();
    }

    @PostMapping
    public Timetable create(@Valid @RequestBody Timetable timetable) {
        return timetableService.createTimetable(timetable);
    }

    @PostMapping("/{id}/publish")
    public Timetable publish(@PathVariable("id") String id) {
        return timetableService.publishTimetable(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        timetableService.deleteTimetable(id);
        return ResponseEntity.noContent().build();
    }

    // ── Auto Generation ───────────────────────────────────────────────────────

    @PostMapping("/{id}/generate")
    public GenerationResultDto generate(@PathVariable("id") String id) {
        return generatorEngine.generate(id);
    }

    // ── Slot Queries ──────────────────────────────────────────────────────────

    @GetMapping("/{id}/slots")
    public List<TimetableSlotDto> getAllSlots(@PathVariable("id") String id) {
        return timetableService.getSlotsForTimetable(id);
    }

    @GetMapping("/{id}/class/{classId}")
    public List<TimetableSlotDto> getForClass(
            @PathVariable("id") String id, @PathVariable("classId") String classId) {
        return timetableService.getSlotsForClass(id, classId);
    }

    @GetMapping("/{id}/teacher/{teacherId}")
    public List<TimetableSlotDto> getForTeacher(
            @PathVariable("id") String id, @PathVariable("teacherId") String teacherId) {
        return timetableService.getSlotsForTeacher(id, teacherId);
    }

    // ── Manual Slot Edit ──────────────────────────────────────────────────────

    @PostMapping("/slot")
    public TimetableSlotDto createSlot(@Valid @RequestBody Map<String, String> body) {
        return timetableService.createSlot(
                body.get("timetableId"),
                body.get("classId"),
                body.get("dayId"),
                body.get("blockId"),
                body.get("classSubjectTeacherId"),
                body.get("roomId"));
    }

    @PutMapping("/slot/{slotId}")
    public TimetableSlotDto updateSlot(
            @PathVariable("slotId") String slotId,
            @Valid @RequestBody Map<String, String> body) {
        return timetableService.updateSlot(
                slotId,
                body.get("classSubjectTeacherId"),
                body.get("roomId"));
    }

    @DeleteMapping("/slot/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable("slotId") String slotId) {
        timetableService.deleteSlot(slotId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/slot/{slotId}/lock")
    public ClassTimetable toggleLock(@PathVariable("slotId") String slotId) {
        return timetableService.toggleLock(slotId);
    }
}
