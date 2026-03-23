package com.schoolerp.core.controller;

import com.schoolerp.core.entity.SchoolClass;
import com.schoolerp.core.service.SchoolClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/classes")
public class SchoolClassController {

    @Autowired
    private SchoolClassService schoolClassService;

    @GetMapping
    public List<SchoolClass> getAllClasses() {
        return schoolClassService.getAllClasses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolClass> getClassById(@PathVariable("id") String id) {
        return schoolClassService.getClassById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SchoolClass createClass(@Valid @RequestBody SchoolClass schoolClass) {
        return schoolClassService.createClass(schoolClass);
    }

    @PatchMapping("/{id}/assign-teacher")
    public SchoolClass assignTeacher(@PathVariable("id") String id, @RequestParam("staffId") String staffId) {
        return schoolClassService.assignTeacher(id, staffId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolClass> updateClass(@PathVariable("id") String id, @Valid @RequestBody SchoolClass schoolClass) {
        return ResponseEntity.ok(schoolClassService.updateClass(id, schoolClass));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable("id") String id) {
        schoolClassService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}
