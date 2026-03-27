package com.schoolerp.lms.service;

import com.schoolerp.lms.entity.CourseMaterial;
import com.schoolerp.lms.repository.CourseMaterialRepository;
import com.schoolerp.lms.entity.Course;
import com.schoolerp.lms.repository.CourseRepository;
import com.schoolerp.lms.dto.CourseMaterialResponse;
import com.schoolerp.lms.context.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseMaterialService {

    private final CourseMaterialRepository repository;
    private final CourseRepository courseRepository;
    private final StorageAbstractionService storageService;

    private Course requireCourseOwnership(String courseId, String role, String staffId) {
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : null;
        if (tenantId == null || tenantId.trim().isEmpty() || "public".equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context is required");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if ("TEACHER".equals(role)) {
            if (staffId == null || !staffId.equals(course.getTeacherId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to manage materials for this course");
            }
        }
        return course;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is missing or empty");
        }
    }

    public CourseMaterialResponse uploadMaterial(String courseId, MultipartFile file, String title, String description, String userId, String staffId, String role) {
        requireCourseOwnership(courseId, role, staffId);
        validateFile(file);

        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";

        try {
            String storageKey = storageService.upload(file, "material-" + courseId + "-" + UUID.randomUUID());

            CourseMaterial material = new CourseMaterial();
            material.setTenantId(tenantId);
            material.setCourseId(courseId);
            material.setTitle(title != null && !title.isEmpty() ? title : file.getOriginalFilename());
            material.setDescription(description);
            material.setStorageKey(storageKey);
            material.setFileName(file.getOriginalFilename());
            material.setMimeType(file.getContentType());
            material.setFileSize(file.getSize());
            material.setUploadedByUserId(userId);
            material.setUploadedByStaffId(staffId);

            return toDto(repository.save(material));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file", e);
        }
    }

    public List<CourseMaterialResponse> getCourseMaterials(String courseId) {
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        return repository.findByTenantIdAndCourseIdAndStatusOrderByCreatedAtDesc(tenantId, courseId, "ACTIVE")
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public String downloadMaterialUrl(String courseId, String materialId) {
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        CourseMaterial m = repository.findByIdAndTenantIdAndCourseId(materialId, tenantId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));
        return storageService.getDownloadUrl(m.getStorageKey());
    }

    public void deleteMaterial(String courseId, String materialId, String role, String staffId) {
        requireCourseOwnership(courseId, role, staffId);
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        
        CourseMaterial material = repository.findByIdAndTenantIdAndCourseId(materialId, tenantId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));
        
        material.setStatus("ARCHIVED");
        repository.save(material);
    }

    private CourseMaterialResponse toDto(CourseMaterial m) {
        return new CourseMaterialResponse(
                m.getId(), m.getCourseId(), m.getTitle(), m.getDescription(),
                m.getFileName(), m.getFileSize(), m.getUploadedByUserId(),
                m.getUploadedByStaffId(), m.getCreatedAt(), m.getUpdatedAt());
    }
}
