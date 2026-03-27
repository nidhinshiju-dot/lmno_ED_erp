package com.schoolerp.lms.controller;

import com.schoolerp.lms.dto.SyllabusStatusResponse;
import com.schoolerp.lms.dto.SyllabusUploadResponse;
import com.schoolerp.lms.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseSyllabusController {

    private final SyllabusService syllabusService;

    @PostMapping("/{courseId}/syllabus")
    public ResponseEntity<SyllabusUploadResponse> uploadSyllabus(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(syllabusService.uploadSyllabus(courseId, file, title, description, userId, staffId, role));
    }

    @GetMapping("/{courseId}/syllabus")
    public ResponseEntity<SyllabusUploadResponse> getLatestSyllabus(@PathVariable String courseId) {
        // Any authenticated user can read
        return ResponseEntity.ok(syllabusService.getLatestSyllabus(courseId));
    }

    @GetMapping("/{courseId}/syllabus/list")
    public ResponseEntity<List<SyllabusUploadResponse>> getSyllabusHistory(@PathVariable String courseId) {
        return ResponseEntity.ok(syllabusService.getSyllabusHistory(courseId));
    }

    @PutMapping("/{courseId}/syllabus/{syllabusId}")
    public ResponseEntity<SyllabusUploadResponse> replaceSyllabus(
            @PathVariable String courseId,
            @PathVariable String syllabusId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(syllabusService.replaceSyllabus(courseId, syllabusId, file, userId, staffId, role));
    }

    @GetMapping("/{courseId}/syllabus/{syllabusId}/download")
    public ResponseEntity<Map<String, String>> downloadSyllabus(@PathVariable String courseId, @PathVariable String syllabusId) {
        String url = syllabusService.downloadSyllabusUrl(courseId, syllabusId);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/syllabus-status")
    public ResponseEntity<List<SyllabusStatusResponse>> getAdminSyllabusStatus(
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(syllabusService.getAdminSyllabusStatus(role));
    }
}
