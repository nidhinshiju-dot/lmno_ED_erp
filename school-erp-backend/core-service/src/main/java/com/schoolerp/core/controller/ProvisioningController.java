package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Parent;
import com.schoolerp.core.entity.School;
import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.repository.ParentRepository;
import com.schoolerp.core.repository.SchoolRepository;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.StudentRepository;
import com.schoolerp.core.service.CredentialsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/provisioning")
@RequiredArgsConstructor
public class ProvisioningController {

    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final CredentialsService credentialsService;

    @GetMapping("/failed")
    public ResponseEntity<Map<String, Object>> getFailedProvisioning() {
        Map<String, Object> response = new HashMap<>();

        List<Staff> failedStaff = staffRepository.findAll().stream()
                .filter(s -> "FAILED".equals(s.getProvisioningStatus()))
                .collect(Collectors.toList());

        List<Student> failedStudents = studentRepository.findAll().stream()
                .filter(s -> "FAILED".equals(s.getProvisioningStatus()))
                .collect(Collectors.toList());

        List<Parent> failedParents = parentRepository.findAll().stream()
                .filter(p -> "FAILED".equals(p.getProvisioningStatus()))
                .collect(Collectors.toList());

        List<School> failedSchools = schoolRepository.findAll().stream()
                .filter(s -> "FAILED".equals(s.getProvisioningStatus()))
                .collect(Collectors.toList());

        response.put("failedStaff", failedStaff);
        response.put("failedStudents", failedStudents);
        response.put("failedParents", failedParents);
        response.put("failedSchools", failedSchools);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/retry/{entityType}/{id}")
    public ResponseEntity<Map<String, String>> retryProvisioning(@PathVariable String entityType, @PathVariable String id) {
        Map<String, String> response = new HashMap<>();
        
        try {
            switch (entityType.toLowerCase()) {
                case "staff":
                    Staff s = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
                    credentialsService.createStaffCredential(s);
                    break;
                case "student":
                    Student st = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
                    credentialsService.createStudentCredential(st);
                    break;
                case "parent":
                    Parent p = parentRepository.findById(java.util.UUID.fromString(id)).orElseThrow(() -> new RuntimeException("Not found"));
                    credentialsService.createParentCredential(p);
                    break;
                case "school":
                    School sch = schoolRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
                    credentialsService.createSchoolAdminCredential(sch);
                    break;
                default:
                    response.put("status", "ERROR");
                    response.put("message", "Invalid entity type: " + entityType);
                    return ResponseEntity.badRequest().body(response);
            }
            response.put("status", "SUCCESS");
            response.put("message", "Retry task initiated asynchronously.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Failed to initiate retry: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
