package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.LessonPlan;
import com.schoolerp.lms.service.LessonPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lesson-plans")
@RequiredArgsConstructor
public class LessonPlanController {

    private final LessonPlanService service;

    @PostMapping
    public ResponseEntity<LessonPlan> create(@RequestBody LessonPlan plan) {
        return ResponseEntity.ok(service.create(plan));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<LessonPlan>> getByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(service.getByTeacher(teacherId));
    }

    @GetMapping("/assignment/{classSubjectTeacherId}")
    public ResponseEntity<List<LessonPlan>> getByAssignment(@PathVariable String classSubjectTeacherId) {
        return ResponseEntity.ok(service.getByAssignment(classSubjectTeacherId));
    }

    @GetMapping("/grade/{gradeLevel}")
    public ResponseEntity<List<LessonPlan>> getByGradeLevel(@PathVariable Integer gradeLevel) {
        return ResponseEntity.ok(service.getByGradeLevel(gradeLevel));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LessonPlan>> getPendingVerifications() {
        return ResponseEntity.ok(service.getPendingVerifications());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LessonPlan> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
