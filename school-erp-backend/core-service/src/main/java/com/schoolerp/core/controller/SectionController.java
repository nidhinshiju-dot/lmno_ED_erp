package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Section;
import com.schoolerp.core.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @GetMapping
    public List<Section> getAllSections() {
        return sectionService.getAllSections();
    }

    @GetMapping("/class/{classId}")
    public List<Section> getSectionsByClassId(@PathVariable String classId) {
        return sectionService.getSectionsByClassId(classId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getSectionById(@PathVariable String id) {
        return sectionService.getSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Section createSection(@RequestBody Section section) {
        return sectionService.createSection(section);
    }

    @PatchMapping("/{id}/assign-teacher")
    public ResponseEntity<Section> assignClassTeacher(@PathVariable String id, @RequestParam String staffId) {
        return ResponseEntity.ok(sectionService.assignClassTeacher(id, staffId));
    }
}
