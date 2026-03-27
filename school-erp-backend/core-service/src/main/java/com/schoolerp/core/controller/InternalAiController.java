package com.schoolerp.core.controller;

import com.schoolerp.core.entity.ExamResult;
import com.schoolerp.core.repository.AttendanceRepository;
import com.schoolerp.core.repository.ExamResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class InternalAiController {

    private final AttendanceRepository attendanceRepository;
    private final ExamResultRepository examResultRepository;

    @Value("${internal.auth.secret:backend-internal-trust-key}")
    private String expectedAuthSecret;

    private boolean isTrusted(String token) {
        return expectedAuthSecret.equals(token);
    }

    @GetMapping("/exams/student/{studentId}/history")
    public ResponseEntity<?> getStudentExamHistory(
            @PathVariable String studentId,
            @RequestHeader(value = "X-Service-Auth", required = false) String authHeader) {
        
        if (!isTrusted(authHeader)) {
            return ResponseEntity.status(403).body("Invalid Service Trust Key");
        }

        List<ExamResult> results = examResultRepository.findByStudentId(studentId);
        List<Map<String, Object>> snapshots = results.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("examId", r.getExamId());
            map.put("marksObtained", r.getMarksObtained());
            map.put("grade", r.getGrade());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", studentId);
        response.put("recentExams", snapshots);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/students/{studentId}/risk/academic")
    public ResponseEntity<?> getAcademicRiskSummary(
            @PathVariable String studentId,
            @RequestHeader(value = "X-Service-Auth", required = false) String authHeader) {
        
        if (!isTrusted(authHeader)) {
            return ResponseEntity.status(403).body("Invalid Service Trust Key");
        }

        // Calculate Attendance Risk
        long totalDays = attendanceRepository.countTotalAttendanceDaysByStudentId(studentId);
        long absences = attendanceRepository.countAbsencesByStudentId(studentId);
        double attendanceDropScore = 0.0;
        if (totalDays > 0) {
            double absentPercentage = ((double) absences / totalDays) * 100.0;
            attendanceDropScore = Math.min(100.0, absentPercentage * 2);
        }

        // Calculate Exam Risk
        List<ExamResult> recentExams = examResultRepository.findByStudentId(studentId); // In reality should limit top 5
        double scoreDropScore = 0.0;
        if (recentExams != null && !recentExams.isEmpty()) {
            double totalObtained = 0.0;
            double totalMax = 0.0;
            for (ExamResult result : recentExams) {
                // Approximate max marks to 100 if null, since it's missing in Entity
                totalObtained += result.getMarksObtained();
                totalMax += 100.0;
            }
            if (totalMax > 0.0) {
                double avgPercent = (totalObtained / totalMax) * 100.0;
                scoreDropScore = Math.max(0.0, 100.0 - ((avgPercent - 40.0) * (100.0 / 60.0)));
                scoreDropScore = Math.min(100.0, scoreDropScore);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", studentId);
        response.put("attendanceDropScore", attendanceDropScore);
        response.put("examsScoreDrop", scoreDropScore);
        return ResponseEntity.ok(response);
    }
}
