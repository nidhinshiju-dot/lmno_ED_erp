package com.schoolerp.lms.service;

import com.schoolerp.lms.entity.Syllabus;
import com.schoolerp.lms.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.schoolerp.lms.entity.Course;
import com.schoolerp.lms.repository.CourseRepository;
import com.schoolerp.lms.dto.SyllabusUploadResponse;
import com.schoolerp.lms.dto.SyllabusStatusResponse;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.schoolerp.lms.context.RequestContext;

@Service
@RequiredArgsConstructor
public class SyllabusService {

    private final SyllabusRepository repository;
    private final CourseRepository courseRepository;
    private final StorageAbstractionService storageService;

    // --- LOGIC ---

    private Course requireCourseOwnership(String courseId, String role, String staffId) {
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : null;
        if (tenantId == null || tenantId.trim().isEmpty() || "public".equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context is required");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        if ("TEACHER".equals(role)) {
            if (staffId == null || !staffId.equals(course.getTeacherId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to manage syllabus for this course");
            }
        } else if (!"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Teacher and Admin can manage syllabus");
        }
        return course;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is missing or empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are supported");
        }
    }

    public SyllabusUploadResponse uploadSyllabus(String courseId, MultipartFile file, String title, String description, String userId, String staffId, String role) {
        requireCourseOwnership(courseId, role, staffId);
        validateFile(file);

        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        Optional<Syllabus> currentTop = repository.findTopByTenantIdAndCourseIdOrderByVersionDesc(tenantId, courseId);
        int nextVersion = currentTop.map(s -> s.getVersion() + 1).orElse(1);

        try {
            String storageKey = storageService.upload(file, "syllabus-" + courseId + "-v" + nextVersion);

            Syllabus syllabus = new Syllabus();
            syllabus.setTenantId(tenantId);
            syllabus.setCourseId(courseId);
            syllabus.setTitle(title != null ? title : file.getOriginalFilename());
            syllabus.setDescription(description);
            syllabus.setStorageKey(storageKey);
            syllabus.setFileName(file.getOriginalFilename());
            syllabus.setMimeType(file.getContentType());
            syllabus.setFileSize(file.getSize());
            syllabus.setVersion(nextVersion);
            syllabus.setUploadedByUserId(userId);
            syllabus.setUploadedByStaffId(staffId);

            return toDto(repository.save(syllabus));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file", e);
        }
    }

    public SyllabusUploadResponse replaceSyllabus(String courseId, String syllabusId, MultipartFile file, String userId, String staffId, String role) {
        requireCourseOwnership(courseId, role, staffId);
        validateFile(file);

        Syllabus oldSyllabus = repository.findById(syllabusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Syllabus not found"));

        if (!oldSyllabus.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Syllabus does not belong to this course");
        }
        
        try {
            storageService.delete(oldSyllabus.getStorageKey());
        } catch(Exception e) {
            // Log orphan delete failure organically
        }

        return uploadSyllabus(courseId, file, oldSyllabus.getTitle(), oldSyllabus.getDescription(), userId, staffId, role);
    }

    public SyllabusUploadResponse getLatestSyllabus(String courseId) {
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        Syllabus s = repository.findTopByTenantIdAndCourseIdOrderByVersionDesc(tenantId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No syllabus found for this course"));
        return toDto(s);
    }

    public List<SyllabusUploadResponse> getSyllabusHistory(String courseId) {
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        return repository.findByTenantIdAndCourseIdOrderByVersionDesc(tenantId, courseId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public String downloadSyllabusUrl(String courseId, String syllabusId) {
        Syllabus s = repository.findById(syllabusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Syllabus not found"));
        if (!s.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Syllabus mismatch");
        }
        return storageService.getDownloadUrl(s.getStorageKey());
    }

    public List<SyllabusStatusResponse> getAdminSyllabusStatus(String role) {
        if (!"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin can view full syllabus status");
        }
        String tenantId = RequestContext.getContext() != null ? RequestContext.getContext().getTenantId() : "public";
        return courseRepository.getAdminSyllabusStatus(tenantId);
    }

    private SyllabusUploadResponse toDto(Syllabus s) {
        return new SyllabusUploadResponse(s.getId(), s.getCourseId(), s.getTitle(), s.getDescription(), 
            s.getFileName(), s.getFileSize(), s.getVersion(), s.getUploadedByUserId(), s.getUploadedByStaffId(), s.getCreatedAt(), s.getUpdatedAt());
    }

    public Syllabus updateStatus(String id, String status) {
        Optional<Syllabus> optional = repository.findById(id);
        if (optional.isPresent()) {
            Syllabus syllabus = optional.get();
            syllabus.setStatus(status);
            return repository.save(syllabus);
        }
        throw new RuntimeException("Syllabus not found");
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
