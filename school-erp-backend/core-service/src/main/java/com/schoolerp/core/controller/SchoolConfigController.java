package com.schoolerp.core.controller;

import com.schoolerp.core.entity.AcademicYear;
import com.schoolerp.core.entity.SchoolSettings;
import com.schoolerp.core.repository.AcademicYearRepository;
import com.schoolerp.core.repository.SchoolSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/school-config")
@RequiredArgsConstructor
public class SchoolConfigController {

    private final AcademicYearRepository academicYearRepository;
    private final SchoolSettingsRepository schoolSettingsRepository;

    // ─── Academic Year Endpoints ─────────────────────────────────────────────

    @GetMapping("/academic-years")
    public List<AcademicYear> getAcademicYears() {
        return academicYearRepository.findByActiveTrueOrderByStartDateDesc();
    }

    @GetMapping("/academic-years/current")
    public ResponseEntity<AcademicYear> getCurrentAcademicYear() {
        return academicYearRepository.findByIsCurrentTrue()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/academic-years")
    public ResponseEntity<AcademicYear> createAcademicYear(@Valid @RequestBody AcademicYear body) {
        // If this is being marked current, clear old current
        if (Boolean.TRUE.equals(body.getIsCurrent())) {
            academicYearRepository.findByIsCurrentTrue().ifPresent(existing -> {
                existing.setIsCurrent(false);
                academicYearRepository.save(existing);
            });
        }
        return ResponseEntity.ok(academicYearRepository.save(body));
    }

    @PutMapping("/academic-years/{id}")
    public ResponseEntity<AcademicYear> updateAcademicYear(
            @PathVariable String id, @Valid @RequestBody AcademicYear body) {
        return academicYearRepository.findById(id).map(ay -> {
            // If setting as current, clear previous
            if (Boolean.TRUE.equals(body.getIsCurrent()) && !Boolean.TRUE.equals(ay.getIsCurrent())) {
                academicYearRepository.findByIsCurrentTrue().ifPresent(prev -> {
                    prev.setIsCurrent(false);
                    academicYearRepository.save(prev);
                });
            }
            ay.setName(body.getName());
            ay.setStartDate(body.getStartDate());
            ay.setEndDate(body.getEndDate());
            ay.setIsCurrent(body.getIsCurrent());
            return ResponseEntity.ok(academicYearRepository.save(ay));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/academic-years/{id}")
    public ResponseEntity<Void> deleteAcademicYear(@PathVariable String id) {
        academicYearRepository.findById(id).ifPresent(ay -> {
            ay.setActive(false);
            academicYearRepository.save(ay);
        });
        return ResponseEntity.noContent().build();
    }

    // ─── School Settings Endpoints ──────────────────────────────────────────

    @GetMapping("/settings")
    public ResponseEntity<SchoolSettings> getSettings(
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "TENANT_001") String tenantId) {
        return schoolSettingsRepository.findByTenantId(tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new SchoolSettings())); // Return empty if not set yet
    }

    @PutMapping("/settings")
    public ResponseEntity<SchoolSettings> saveSettings(
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "TENANT_001") String tenantId,
            @Valid @RequestBody SchoolSettings body) {
        SchoolSettings settings = schoolSettingsRepository.findByTenantId(tenantId)
                .orElse(new SchoolSettings());

        settings.setTenantId(tenantId);
        settings.setSchoolName(body.getSchoolName());
        settings.setSchoolAddress(body.getSchoolAddress());
        settings.setSchoolPhone(body.getSchoolPhone());
        settings.setSchoolEmail(body.getSchoolEmail());
        settings.setSchoolWebsite(body.getSchoolWebsite());
        settings.setLogoUrl(body.getLogoUrl());
        settings.setTimezone(body.getTimezone());
        settings.setLanguage(body.getLanguage());
        settings.setCurrency(body.getCurrency());
        settings.setDateFormat(body.getDateFormat());
        settings.setGradingScale(body.getGradingScale());
        settings.setSchoolStartTime(body.getSchoolStartTime());
        settings.setSchoolEndTime(body.getSchoolEndTime());
        settings.setWorkingDays(body.getWorkingDays());
        settings.setPrimaryColor(body.getPrimaryColor());

        return ResponseEntity.ok(schoolSettingsRepository.save(settings));
    }
}
