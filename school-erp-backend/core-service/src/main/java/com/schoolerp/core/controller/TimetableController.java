package com.schoolerp.core.controller;

import com.schoolerp.core.entity.TimetableEntry;
import com.schoolerp.core.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<List<TimetableEntry>> getAll() {
        return ResponseEntity.ok(timetableService.getAll());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<TimetableEntry>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(timetableService.getByClassId(classId));
    }

    @PostMapping
    public ResponseEntity<TimetableEntry> create(@RequestBody TimetableEntry entry) {
        return ResponseEntity.ok(timetableService.create(entry));
    }
}
