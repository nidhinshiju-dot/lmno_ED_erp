package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByClassIdAndDate(String classId, LocalDate date);
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByStudentIdAndDateBetween(String studentId, LocalDate start, LocalDate end);
}
