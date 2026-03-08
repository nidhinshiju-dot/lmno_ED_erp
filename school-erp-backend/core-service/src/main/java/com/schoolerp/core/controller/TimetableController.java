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

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<TimetableEntry>> getBySection(@PathVariable String sectionId) {
        return ResponseEntity.ok(timetableService.getBySectionId(sectionId));
    }

    @PostMapping
    public ResponseEntity<TimetableEntry> create(@RequestBody TimetableEntry entry) {
        return ResponseEntity.ok(timetableService.create(entry));
    }
}
