package com.schoolerp.core.repository;

import com.schoolerp.core.entity.AttendanceAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceAuditLogRepository extends JpaRepository<AttendanceAuditLog, String> {
    List<AttendanceAuditLog> findByStudentIdOrderByTimestampDesc(String studentId);
    List<AttendanceAuditLog> findByAttendanceIdOrderByTimestampDesc(String attendanceId);
}
