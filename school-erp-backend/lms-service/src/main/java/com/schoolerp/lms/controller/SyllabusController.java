package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.Syllabus;
import com.schoolerp.lms.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabi")
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusService service;

    @PostMapping
    public ResponseEntity<Syllabus> create(@RequestBody Syllabus syllabus) {
        return ResponseEntity.ok(service.create(syllabus));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Syllabus>> getByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(service.getByTeacher(teacherId));
    }

    @GetMapping("/assignment/{classSubjectTeacherId}")
    public ResponseEntity<List<Syllabus>> getByAssignment(@PathVariable String classSubjectTeacherId) {
        return ResponseEntity.ok(service.getByAssignment(classSubjectTeacherId));
    }

    @GetMapping("/grade/{gradeLevel}")
    public ResponseEntity<List<Syllabus>> getByGradeLevel(@PathVariable Integer gradeLevel) {
        return ResponseEntity.ok(service.getByGradeLevel(gradeLevel));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Syllabus>> getPendingVerifications() {
        return ResponseEntity.ok(service.getPendingVerifications());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Syllabus> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
