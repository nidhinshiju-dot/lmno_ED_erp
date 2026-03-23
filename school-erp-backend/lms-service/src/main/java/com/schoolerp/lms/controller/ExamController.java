package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.Exam;
import com.schoolerp.lms.entity.ExamTimetable;
import com.schoolerp.lms.entity.StudentMark;
import com.schoolerp.lms.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    // --- Exams ---
    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        return ResponseEntity.ok(examService.createExam(exam));
    }

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Exam>> getExamsByClass(@PathVariable("classId") String classId) {
        return ResponseEntity.ok(examService.getExamsByClass(classId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Exam>> getExamsByTeacher(@PathVariable("teacherId") String teacherId) {
        return ResponseEntity.ok(examService.getExamsByTeacher(teacherId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable("id") String id) {
        return examService.getExamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable("id") String id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    // --- Timetables ---
    @PostMapping("/timetable")
    public ResponseEntity<ExamTimetable> scheduleExam(@RequestBody ExamTimetable timetable) {
        return ResponseEntity.ok(examService.scheduleExam(timetable));
    }

    @GetMapping("/timetable/class/{classId}")
    public ResponseEntity<List<ExamTimetable>> getTimetableByClass(@PathVariable("classId") String classId) {
        return ResponseEntity.ok(examService.getTimetableByClass(classId));
    }

    @DeleteMapping("/timetable/{id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable("id") String id) {
        examService.deleteTimetable(id);
        return ResponseEntity.noContent().build();
    }

    // --- Marks ---
    @PostMapping("/marks")
    public ResponseEntity<StudentMark> recordMark(@RequestBody StudentMark mark) {
        return ResponseEntity.ok(examService.recordMark(mark));
    }

    @GetMapping("/{examId}/marks")
    public ResponseEntity<List<StudentMark>> getMarksByExam(@PathVariable("examId") String examId) {
        return ResponseEntity.ok(examService.getMarksByExam(examId));
    }
}
