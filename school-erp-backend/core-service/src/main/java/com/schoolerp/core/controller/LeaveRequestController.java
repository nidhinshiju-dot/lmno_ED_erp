package com.schoolerp.core.controller;

import com.schoolerp.core.entity.LeaveRequest;
import com.schoolerp.core.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveService;

    @PostMapping
    public ResponseEntity<LeaveRequest> submitLeaveRequest(@RequestBody LeaveRequest request) {
        try {
            return ResponseEntity.ok(leaveService.createLeaveRequest(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves(@RequestHeader("X-Student-ID") String studentId) {
        return ResponseEntity.ok(leaveService.getStudentLeaveHistory(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveDetail(
            @PathVariable String id,
            @RequestHeader(value = "X-Student-ID", required = false) String studentId) {
        try {
            return ResponseEntity.ok(leaveService.getLeaveDetail(id, studentId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<LeaveRequest> cancelLeave(
            @PathVariable String id,
            @RequestHeader("X-Student-ID") String studentId) {
        try {
            return ResponseEntity.ok(leaveService.cancelLeave(id, studentId));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaves(@RequestHeader("X-Class-ID") String classId) {
        return ResponseEntity.ok(leaveService.getPendingLeavesForClass(classId));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeave(
            @PathVariable String id,
            @RequestHeader("X-Class-ID") String classId,
            @RequestHeader("X-Staff-ID") String staffId) {
        try {
            return ResponseEntity.ok(leaveService.reviewLeave(id, classId, "APPROVED", staffId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeave(
            @PathVariable String id,
            @RequestHeader("X-Class-ID") String classId,
            @RequestHeader("X-Staff-ID") String staffId) {
        try {
            return ResponseEntity.ok(leaveService.reviewLeave(id, classId, "REJECTED", staffId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }
}
