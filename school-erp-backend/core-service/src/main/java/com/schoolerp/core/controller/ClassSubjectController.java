package com.schoolerp.core.controller;

import com.schoolerp.core.dto.ClassSubjectDto;
import com.schoolerp.core.entity.ClassSubject;
import com.schoolerp.core.service.ClassSubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/class-subjects")
@RequiredArgsConstructor
public class ClassSubjectController {

    private final ClassSubjectService classSubjectService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ClassSubjectDto>> getByClass(@PathVariable("classId") String classId) {
        return ResponseEntity.ok(classSubjectService.getSubjectsByClassId(classId));
    }

    @PostMapping
    public ResponseEntity<ClassSubject> assignSubject(@RequestBody ClassSubject classSubject) {
        return ResponseEntity.ok(classSubjectService.assignSubjectToClass(classSubject));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassSubject> updateAssignment(@PathVariable("id") String id,
            @RequestBody ClassSubject classSubject) {
        return ResponseEntity.ok(classSubjectService.updateAssignment(id, classSubject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unassignSubject(@PathVariable("id") String id) {
        classSubjectService.unassignById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/class/{classId}/subject/{subjectId}")
    public ResponseEntity<Void> removeSubjectFromClass(@PathVariable("classId") String classId,
            @PathVariable("subjectId") String subjectId) {
        classSubjectService.removeSubjectFromClass(classId, subjectId);
        return ResponseEntity.noContent().build();
    }
}
