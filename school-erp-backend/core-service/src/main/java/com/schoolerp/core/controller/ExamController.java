package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Exam;
import com.schoolerp.core.entity.ExamResult;
import com.schoolerp.core.repository.ExamResultRepository;
import com.schoolerp.core.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final ExamResultRepository examResultRepository;

    @GetMapping
    public ResponseEntity<List<Exam>> getAll() {
        return ResponseEntity.ok(examService.getAll());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Exam>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(examService.getByClassId(classId));
    }

    @PostMapping
    public ResponseEntity<Exam> create(@RequestBody Exam exam) {
        return ResponseEntity.ok(examService.create(exam));
    }

    @GetMapping("/{examId}/results")
    public ResponseEntity<List<ExamResult>> getResults(@PathVariable String examId) {
        return ResponseEntity.ok(examService.getResults(examId));
    }

    @GetMapping("/results/student/{studentId}")
    public ResponseEntity<List<ExamResult>> getStudentResults(@PathVariable String studentId) {
        return ResponseEntity.ok(examService.getStudentResults(studentId));
    }

    @PostMapping("/{examId}/results")
    public ResponseEntity<List<ExamResult>> saveResults(@RequestBody List<ExamResult> results) {
        return ResponseEntity.ok(examService.saveResults(results));
    }

    /**
     * A14 — Publish results and auto-generate class rank.
     * Fetches all results for the exam, sorts by marksObtained descending,
     * assigns classRank (1 = top), then saves and returns.
     */
    @PostMapping("/{examId}/publish")
    public ResponseEntity<List<ExamResult>> publishResults(@PathVariable String examId) {
        List<ExamResult> results = examResultRepository.findByExamId(examId);
        if (results.isEmpty()) return ResponseEntity.notFound().build();

        // Sort descending by marks
        results.sort(Comparator.comparingInt(ExamResult::getMarksObtained).reversed());

        int total = results.size();
        // Handle ties — students with the same marks get the same rank
        int currentRank = 1;
        List<ExamResult> updated = new ArrayList<>();
        for (int i = 0; i < total; i++) {
            ExamResult r = results.get(i);
            if (i > 0 && r.getMarksObtained() == results.get(i - 1).getMarksObtained()) {
                r.setClassRank(results.get(i - 1).getClassRank()); // Same rank for tie
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
