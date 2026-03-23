package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private com.schoolerp.core.repository.ClassSubjectTeacherRepository classSubjectTeacherRepository;

    @GetMapping
    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable("id") String id) {
        return staffService.getStaffById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Staff createStaff(@RequestBody Staff staff, HttpServletRequest request) {
        String tenantId = extractTenantIdFromJwt(request);
        return staffService.createStaff(staff, tenantId);
    }

    private String extractTenantIdFromJwt(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String[] parts = token.split("\\.");
                if (parts.length == 3) {
                    String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                    // Parse tenantId from JWT payload JSON
                    if (payload.contains("\"tenantId\":")) {
                        String val = payload.split("\"tenantId\":\"")[1].split("\"")[0];
                        return val;
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    /** B1/B6 — Activate or deactivate a staff/teacher account */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Staff> toggleStatus(
            @PathVariable("id") String id, @Valid @RequestBody Map<String, String> body) {
        return staffRepository.findById(id).map(staff -> {
            String newStatus = body.getOrDefault("status", staff.getStatus());
            staff.setStatus(newStatus); // ACTIVE, INACTIVE
            return ResponseEntity.ok(staffRepository.save(staff));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Edit full staff profile */
    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(
            @PathVariable("id") String id, @Valid @RequestBody Staff body) {
        return staffRepository.findById(id).map(staff -> {
            if (body.getName() != null)
                staff.setName(body.getName());
            if (body.getDepartment() != null)
                staff.setDepartment(body.getDepartment());
            if (body.getDesignation() != null)
                staff.setDesignation(body.getDesignation());
            if (body.getRole() != null)
                staff.setRole(body.getRole());
            if (body.getEmail() != null)
                staff.setEmail(body.getEmail());
            if (body.getPhone() != null)
                staff.setPhone(body.getPhone());
            if (body.getStatus() != null)
                staff.setStatus(body.getStatus());
            if (body.getSubjects() != null)
                staff.setSubjects(body.getSubjects());
            if (body.getTeacherType() != null)
                staff.setTeacherType(body.getTeacherType());
            if (body.getMaxPeriods() != null) {
                // Calculate current workload to ensure we don't drop below it
                int currentAssigned = classSubjectTeacherRepository.findByTeacherId(id).stream()
                        .mapToInt(cs -> cs.getPeriodsPerWeek() != null ? cs.getPeriodsPerWeek() : 0)
                        .sum();

                if (body.getMaxPeriods() < currentAssigned) {
                    throw new com.schoolerp.core.exception.DependencyConflictException(
                            "Cannot reduce max workload (" + body.getMaxPeriods() + 
                            ") below the currently assigned " + currentAssigned + " periods."
                    );
                }
                staff.setMaxPeriods(body.getMaxPeriods());
            }
            if (body.getWorkloadRatio() != null)
                staff.setWorkloadRatio(body.getWorkloadRatio());
            return ResponseEntity.ok(staffRepository.save(staff));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
