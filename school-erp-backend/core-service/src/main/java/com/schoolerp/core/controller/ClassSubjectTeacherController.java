package com.schoolerp.core.controller;

import com.schoolerp.core.dto.ClassSubjectTeacherDto;
import com.schoolerp.core.entity.ClassSubjectTeacher;
import com.schoolerp.core.service.ClassSubjectTeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/class-subject-teachers")
@RequiredArgsConstructor
public class ClassSubjectTeacherController {

    private final ClassSubjectTeacherService service;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ClassSubjectTeacherDto>> getByClassId(@PathVariable("classId") String classId) {
        return ResponseEntity.ok(service.getByClassId(classId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassSubjectTeacherDto>> getByTeacherId(@PathVariable("teacherId") String teacherId) {
        return ResponseEntity.ok(service.getByTeacherId(teacherId));
    }

    @PostMapping
    public ResponseEntity<ClassSubjectTeacherDto> create(@Valid @RequestBody ClassSubjectTeacher assignment) {
        return ResponseEntity.ok(service.create(assignment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassSubjectTeacherDto> update(@PathVariable("id") String id,
            @Valid @RequestBody ClassSubjectTeacher assignment) {
        return ResponseEntity.ok(service.update(id, assignment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
