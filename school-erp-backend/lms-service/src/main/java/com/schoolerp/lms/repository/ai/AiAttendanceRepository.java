package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiAttendanceRepository extends JpaRepository<AiAttendance, String> {

    List<AiAttendance> findByStudentId(String studentId);
    
    List<AiAttendance> findByClassId(String classId);
    
    // For calculating student risk
    @Query("SELECT COUNT(a) FROM AiAttendance a WHERE a.studentId = :studentId AND a.status = 'ABSENT'")
    long countAbsencesByStudentId(@Param("studentId") String studentId);
    
    @Query("SELECT COUNT(a) FROM AiAttendance a WHERE a.studentId = :studentId")
    long countTotalAttendanceDaysByStudentId(@Param("studentId") String studentId);
}
