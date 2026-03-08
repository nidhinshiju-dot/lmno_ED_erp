package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Subject;
import com.schoolerp.core.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<Subject>> getAll() {
        return ResponseEntity.ok(subjectService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getById(@PathVariable String id) {
        return subjectService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Subject>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(subjectService.getByClassId(classId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Subject>> getByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(subjectService.getByTeacherId(teacherId));
    }

    @PostMapping
    public ResponseEntity<Subject> create(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.create(subject));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> update(@PathVariable String id, @RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.update(id, subject));
    }
}
