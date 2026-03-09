package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private StaffRepository staffRepository;

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
    public Staff createStaff(@RequestBody Staff staff) {
        return staffService.createStaff(staff);
    }

    /** B1/B6 — Activate or deactivate a staff/teacher account */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Staff> toggleStatus(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return staffRepository.findById(id).map(staff -> {
            String newStatus = body.getOrDefault("status", staff.getStatus());
            staff.setStatus(newStatus); // ACTIVE, INACTIVE
            return ResponseEntity.ok(staffRepository.save(staff));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Edit full staff profile */
    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(
            @PathVariable String id, @RequestBody Staff body) {
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
            return ResponseEntity.ok(staffRepository.save(staff));
        }).orElse(ResponseEntity.notFound().build());
    }
}
