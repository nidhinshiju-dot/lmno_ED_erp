package com.schoolerp.core.service;

import com.schoolerp.core.repository.AttendanceRepository;
import com.schoolerp.core.repository.StudentRepository;
import com.schoolerp.core.repository.ExamResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final ExamResultRepository examResultRepository;

    public Map<String, Object> getAttendanceReport(String classId, LocalDate from, LocalDate to) {
        var students = studentRepository.findByClassId(classId);
        int totalStudents = students.size();

        long totalPresent = 0, totalAbsent = 0, totalLate = 0;
        for (var student : students) {
            var records = attendanceRepository.findByStudentIdAndDateBetween(student.getId(), from, to);
            totalPresent += records.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
            totalAbsent += records.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
            totalLate += records.stream().filter(r -> "LATE".equals(r.getStatus())).count();
        }

        long totalRecords = totalPresent + totalAbsent + totalLate;
        double attendanceRate = totalRecords > 0 ? (double) totalPresent / totalRecords * 100 : 0;

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("classId", classId);
        report.put("from", from.toString());
        report.put("to", to.toString());
        report.put("totalStudents", totalStudents);
        report.put("totalPresent", totalPresent);
        report.put("totalAbsent", totalAbsent);
        report.put("totalLate", totalLate);
        report.put("attendanceRate", Math.round(attendanceRate * 100.0) / 100.0);
        return report;
    }

    public Map<String, Object> getExamReport(String examId) {
        var results = examResultRepository.findByExamId(examId);
        int count = results.size();
        double avgMarks = results.stream().mapToInt(r -> r.getMarksObtained()).average().orElse(0);
        int maxMarks = results.stream().mapToInt(r -> r.getMarksObtained()).max().orElse(0);
        int minMarks = results.stream().mapToInt(r -> r.getMarksObtained()).min().orElse(0);

        Map<String, Long> gradeDistribution = new LinkedHashMap<>();
        results.forEach(r -> {
            String grade = r.getGrade() != null ? r.getGrade() : "Ungraded";
            gradeDistribution.put(grade, gradeDistribution.getOrDefault(grade, 0L) + 1L);
        });

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("examId", examId);
        report.put("totalStudents", count);
        report.put("averageMarks", Math.round(avgMarks * 100.0) / 100.0);
        report.put("highestMarks", maxMarks);
        report.put("lowestMarks", minMarks);
        report.put("gradeDistribution", gradeDistribution);
        return report;
    }

    public Map<String, Object> getStudentReport(String studentId) {
        var student = studentRepository.findById(studentId);
        var attendance = attendanceRepository.findByStudentId(studentId);
        var examResults = examResultRepository.findByStudentId(studentId);

        long present = attendance.stream().filter(a -> "PRESENT".equals(a.getStatus())).count();
        long totalDays = attendance.size();
        double attendanceRate = totalDays > 0 ? (double) present / totalDays * 100 : 0;
        double avgMarks = examResults.stream().mapToInt(r -> r.getMarksObtained()).average().orElse(0);

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("studentId", studentId);
        report.put("studentName", student.map(s -> s.getName()).orElse("Unknown"));
        report.put("totalAttendanceDays", totalDays);
        report.put("presentDays", present);
        report.put("attendanceRate", Math.round(attendanceRate * 100.0) / 100.0);
        report.put("totalExams", examResults.size());
        report.put("averageMarks", Math.round(avgMarks * 100.0) / 100.0);
        return report;
    }
}
