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
    public ResponseEntity<Subject> getById(@PathVariable("id") String id) {
        return subjectService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Subject> create(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.create(subject));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> update(@PathVariable("id") String id, @RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.update(id, subject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
