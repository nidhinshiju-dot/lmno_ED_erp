package com.schoolerp.core.controller;

import com.schoolerp.core.entity.TeacherAvailability;
import com.schoolerp.core.service.TeacherAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher-availability")
@RequiredArgsConstructor
public class TeacherAvailabilityController {

    private final TeacherAvailabilityService service;

    @GetMapping("/teacher/{teacherId}")
    public List<TeacherAvailability> getByTeacher(@PathVariable String teacherId) {
        return service.getByTeacher(teacherId);
    }

    @PostMapping
    public TeacherAvailability save(@RequestBody TeacherAvailability availability) {
        return service.save(availability);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
