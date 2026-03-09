package com.schoolerp.core.service;

import com.schoolerp.core.entity.Attendance;
import com.schoolerp.core.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public List<Attendance> getByClassAndDate(String classId, LocalDate date) {
        return attendanceRepository.findByClassIdAndDate(classId, date);
    }

    public List<Attendance> getByStudentId(String studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getByStudentAndDateRange(String studentId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, start, end);
    }

    public List<Attendance> markAttendance(List<Attendance> records) {
        return attendanceRepository.saveAll(records);
    }
}
