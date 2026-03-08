package com.schoolerp.core.controller;

import com.schoolerp.core.entity.School;
import com.schoolerp.core.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @GetMapping
    public ResponseEntity<List<School>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @PostMapping
    public ResponseEntity<School> createSchool(@RequestBody School school) {
        return ResponseEntity.ok(schoolService.createSchool(school));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<School> toggleStatus(@PathVariable String id) {
        return ResponseEntity.ok(schoolService.toggleStatus(id));
    }
}
