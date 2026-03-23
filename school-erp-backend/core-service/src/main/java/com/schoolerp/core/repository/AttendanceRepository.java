package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByClassIdAndDate(String classId, LocalDate date);
    List<Attendance> findByClassIdAndDateAndPeriodBlockId(String classId, LocalDate date, String periodBlockId);
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByStudentIdAndDateBetween(String studentId, LocalDate start, LocalDate end);
    Optional<Attendance> findByStudentIdAndDateAndPeriodBlockId(String studentId, LocalDate date, String periodBlockId);
}
