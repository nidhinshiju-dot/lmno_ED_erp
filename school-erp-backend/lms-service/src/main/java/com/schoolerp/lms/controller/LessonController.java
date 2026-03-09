package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.Lesson;
import com.schoolerp.lms.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @GetMapping("/course/{courseId}")
    public List<Lesson> getLessonsByCourseId(@PathVariable String courseId) {
        return lessonService.getLessonsByCourseId(courseId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable String id) {
        return lessonService.getLessonById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Lesson createLesson(@Valid @RequestBody Lesson lesson) {
        return lessonService.createLesson(lesson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable String id, @Valid @RequestBody Lesson body) {
        return lessonService.getLessonById(id).map(lesson -> {
            lesson.setTitle(body.getTitle());
            lesson.setContentUrl(body.getContentUrl());
            lesson.setAttachmentName(body.getAttachmentName());
            lesson.setAttachmentType(body.getAttachmentType());
            lesson.setOrderIndex(body.getOrderIndex());
            return ResponseEntity.ok(lessonService.createLesson(lesson));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable String id) {
        if (lessonService.getLessonById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}

