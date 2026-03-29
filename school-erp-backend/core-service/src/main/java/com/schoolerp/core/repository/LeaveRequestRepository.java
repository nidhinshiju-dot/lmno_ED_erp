package com.schoolerp.core.repository;

import com.schoolerp.core.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {
    
    // For Family App fetching their own leave history (using isolated ID)
    List<LeaveRequest> findByStudentIdOrderByCreatedAtDesc(String studentId);
    
    // For Teacher App fetching pending leaves for their assigned class
    List<LeaveRequest> findByClassIdAndStatusOrderByCreatedAtDesc(String classId, String status);
}
