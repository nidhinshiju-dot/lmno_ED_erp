package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Exam;
import com.schoolerp.core.entity.ExamResult;
import com.schoolerp.core.entity.ExamSchedule;
import com.schoolerp.core.repository.ExamResultRepository;
import com.schoolerp.core.repository.ExamScheduleRepository;
import com.schoolerp.core.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final ExamResultRepository examResultRepository;
    private final ExamScheduleRepository examScheduleRepository;

    @GetMapping("/{examId}/schedules")
    public ResponseEntity<List<ExamSchedule>> getSchedules(@PathVariable String examId) {
        return ResponseEntity.ok(examScheduleRepository.findByExamId(examId));
    }

    @GetMapping
    public ResponseEntity<List<Exam>> getAll() {
        return ResponseEntity.ok(examService.getAll());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Exam>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(examService.getByClassId(classId));
    }

    @GetMapping("/teacher/me")
    public ResponseEntity<List<Exam>> getMyTeacherExams(
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId) {
        try {
            return ResponseEntity.ok(examService.getMyTeacherExams(staffId));
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping
    public ResponseEntity<Exam> create(
            @Valid @RequestBody Exam exam,
            @RequestHeader(value = "X-User-Role", required = true) String role) {
        try {
            return ResponseEntity.ok(examService.create(exam, role));
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/{examId}/results")
    public ResponseEntity<List<ExamResult>> getResults(@PathVariable String examId) {
        return ResponseEntity.ok(examService.getResults(examId));
    }

    @GetMapping("/results/student/me")
    public ResponseEntity<List<ExamResult>> getMyStudentResults(
            @RequestHeader(value = "X-User-ID", required = true) String userId) {
        return ResponseEntity.ok(examService.getMyStudentResults(userId));
    }

    @GetMapping("/results/parent/me")
    public ResponseEntity<List<ExamResult>> getMyParentChildrenResults(
            @RequestHeader(value = "X-User-ID", required = true) String userId) {
        return ResponseEntity.ok(examService.getMyParentChildrenResults(userId));
    }

    @PostMapping("/{examId}/results")
    public ResponseEntity<?> saveResults(
            @PathVariable String examId,
            @Valid @RequestBody List<ExamResult> results,
            @RequestHeader(value = "X-User-Role", required = true) String role,
            @RequestHeader(value = "X-Staff-ID", required = false) String staffId) {
        try {
            return ResponseEntity.ok(examService.saveResults(examId, results, role, staffId));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    /**
     * Publish results and auto-generate class rank.
     */
    @PostMapping("/{examId}/publish")
    public ResponseEntity<?> publishResults(
            @PathVariable String examId,
            @RequestHeader(value = "X-User-Role", required = true) String role) {
        
        if (!"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only ADMIN can publish rank results");
        }

        List<ExamResult> results = examResultRepository.findByExamId(examId);
        if (results.isEmpty()) return ResponseEntity.notFound().build();

        results.sort(Comparator.comparingInt(ExamResult::getMarksObtained).reversed());

        int total = results.size();
        int currentRank = 1;
        List<ExamResult> updated = new ArrayList<>();
        for (int i = 0; i < total; i++) {
            ExamResult r = results.get(i);
            if (i > 0 && r.getMarksObtained() == results.get(i - 1).getMarksObtained()) {
                r.setClassRank(results.get(i - 1).getClassRank());
            } else {
                r.setClassRank(currentRank);
            }
            r.setTotalStudents(total);
            currentRank++;
            updated.add(r);
        }

        return ResponseEntity.ok(examResultRepository.saveAll(updated));
    }
}
