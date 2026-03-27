package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Announcement;
import com.schoolerp.core.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementService.getAll());
    }

    @GetMapping("/scope/{scope}")
    public ResponseEntity<List<Announcement>> getByScope(@PathVariable String scope) {
        return ResponseEntity.ok(announcementService.getByScope(scope));
    }

    @GetMapping("/student")
    public ResponseEntity<List<Announcement>> getForStudent(@RequestHeader(value="X-Class-ID", required=false) String classId) {
        return ResponseEntity.ok(announcementService.getForStudent(classId));
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<Announcement>> getForTeacher(@RequestHeader(value="X-Staff-ID", required=false) String staffId) {
        return ResponseEntity.ok(announcementService.getForTeacher(staffId));
    }

    @Autowired
    private com.schoolerp.core.service.PushNotificationService pushNotificationService;

    @PostMapping
    public ResponseEntity<Announcement> create(@Valid @RequestBody Announcement announcement) {
        Announcement saved = announcementService.create(announcement);
        
        // Trigger push notification based on scope and roles
        String topic = "school_announcements"; // default fallback topic
        if ("CLASS".equals(saved.getScope()) && saved.getTargetId() != null) {
            topic = "class_" + saved.getTargetId();
        }
        
        pushNotificationService.sendTopicNotification(
                topic,
                "New Announcement: " + saved.getTitle(),
                saved.getContent() != null && saved.getContent().length() > 50 
                        ? saved.getContent().substring(0, 47) + "..." 
                        : saved.getContent()
        );
        
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        announcementService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
