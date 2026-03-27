package com.schoolerp.lms.controller;

import com.schoolerp.lms.dto.CourseMaterialResponse;
import com.schoolerp.lms.service.CourseMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/materials")
@RequiredArgsConstructor
public class CourseMaterialController {

    private final CourseMaterialService service;

    @PostMapping
    public ResponseEntity<CourseMaterialResponse> uploadMaterial(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "STUDENT") String role) {

        return ResponseEntity.ok(service.uploadMaterial(courseId, file, title, description, userId, staffId, role));
    }

    @GetMapping
    public ResponseEntity<List<CourseMaterialResponse>> getMaterials(@PathVariable String courseId) {
        return ResponseEntity.ok(service.getCourseMaterials(courseId));
    }

    @GetMapping("/{materialId}/download")
    public ResponseEntity<Map<String, String>> downloadMaterialUrl(
            @PathVariable String courseId,
            @PathVariable String materialId) {
        String url = service.downloadMaterialUrl(courseId, materialId);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/{materialId}")
    public ResponseEntity<CourseMaterialResponse> getMaterial(
            @PathVariable String courseId,
            @PathVariable String materialId) {
        return ResponseEntity.ok(service.getMaterialById(courseId, materialId));
    }

    @PutMapping("/{materialId}")
    public ResponseEntity<CourseMaterialResponse> updateMaterial(
            @PathVariable String courseId,
            @PathVariable String materialId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "STUDENT") String role,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId) {

        return ResponseEntity.ok(service.updateMaterial(courseId, materialId, file, title, description, role, staffId));
    }

    @PatchMapping("/{materialId}/archive")
    public ResponseEntity<Void> archiveMaterialCanonical(
            @PathVariable String courseId,
            @PathVariable String materialId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "STUDENT") String role,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId) {

        service.archiveMaterial(courseId, materialId, role, staffId);
        return ResponseEntity.noContent().build();
    }

    @Deprecated
    @DeleteMapping("/{materialId}")
    public ResponseEntity<Void> deleteMaterialDeprecatedAlias(
            @PathVariable String courseId,
            @PathVariable String materialId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "STUDENT") String role,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId) {

        service.archiveMaterial(courseId, materialId, role, staffId);
        return ResponseEntity.noContent().build();
    }
}
