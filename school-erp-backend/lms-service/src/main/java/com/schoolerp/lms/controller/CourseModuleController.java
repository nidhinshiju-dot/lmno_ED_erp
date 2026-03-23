package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.CourseModule;
import com.schoolerp.lms.repository.CourseModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

/**
 * A6 — Course Modules API.
 * Enables grouping lessons into chapters/modules within a course.
 */
@RestController
@RequestMapping("/api/v1/modules")
public class CourseModuleController {

    @Autowired
    private CourseModuleRepository moduleRepository;

    /** List all modules for a course (ordered) */
    @GetMapping("/course/{courseId}")
    public List<CourseModule> getModulesByCourse(@PathVariable String courseId) {
        return moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
    }

    /** Get single module */
    @GetMapping("/{id}")
    public ResponseEntity<CourseModule> getById(@PathVariable String id) {
        return moduleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Create a module */
    @PostMapping
    public ResponseEntity<CourseModule> create(@Valid @RequestBody CourseModule module) {
        return ResponseEntity.ok(moduleRepository.save(module));
    }

    /** Edit a module */
    @PutMapping("/{id}")
    public ResponseEntity<CourseModule> update(@PathVariable String id, @Valid @RequestBody CourseModule body) {
        return moduleRepository.findById(id).map(m -> {
            m.setTitle(body.getTitle());
            m.setDescription(body.getDescription());
            m.setOrderIndex(body.getOrderIndex());
            return ResponseEntity.ok(moduleRepository.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Delete a module */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (moduleRepository.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        moduleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

