package com.schoolerp.core.service;

import com.schoolerp.core.entity.LeaveRequest;
import com.schoolerp.core.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRepository;

    public LeaveRequest createLeaveRequest(LeaveRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
        return leaveRepository.save(request);
    }

    public List<LeaveRequest> getStudentLeaveHistory(String studentId) {
        return leaveRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public LeaveRequest getLeaveDetail(String id, String requestorStudentId) {
        LeaveRequest req = leaveRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave Request not found"));
        // Tenant isolation: Ensure student owns this if student requesting
        if (requestorStudentId != null && !req.getStudentId().equals(requestorStudentId)) {
            throw new SecurityException("Unauthorized access to leave request");
        }
        return req;
    }

    public List<LeaveRequest> getPendingLeavesForClass(String classId) {
        return leaveRepository.findByClassIdAndStatusOrderByCreatedAtDesc(classId, "PENDING");
    }

    public LeaveRequest cancelLeave(String id, String studentId) {
        LeaveRequest req = getLeaveDetail(id, studentId);
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("Only pending leaves can be cancelled");
        }
        req.setStatus("CANCELLED");
        return leaveRepository.save(req);
    }

    public LeaveRequest reviewLeave(String id, String classId, String status, String approvedBy) {
        LeaveRequest req = leaveRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave Request not found"));
        
        // Authorization: Ensure teacher actually manages this class
        if (classId != null && !req.getClassId().equals(classId)) {
            throw new SecurityException("Teacher not authorized for this class leave request");
        }
        
        req.setStatus(status.toUpperCase());
        req.setApprovedBy(approvedBy);
        return leaveRepository.save(req);
    }
}
