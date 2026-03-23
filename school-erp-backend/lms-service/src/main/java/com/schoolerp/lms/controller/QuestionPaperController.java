package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.QuestionPaper;
import com.schoolerp.lms.service.QuestionPaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/question-papers")
public class QuestionPaperController {

    @Autowired
    private QuestionPaperService questionPaperService;

    @PostMapping
    public ResponseEntity<QuestionPaper> savePaper(@RequestBody QuestionPaper paper) {
        return ResponseEntity.ok(questionPaperService.savePaper(paper));
    }

    @GetMapping
    public ResponseEntity<List<QuestionPaper>> getAllPapers() {
        return ResponseEntity.ok(questionPaperService.getAllPapers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionPaper> getPaperById(@PathVariable("id") String id) {
        return questionPaperService.getPaperById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<QuestionPaper>> getPapersByExam(@PathVariable("examId") String examId) {
        return ResponseEntity.ok(questionPaperService.getPapersByExam(examId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<QuestionPaper>> getPapersByTeacher(@PathVariable("teacherId") String teacherId) {
        return ResponseEntity.ok(questionPaperService.getPapersByTeacher(teacherId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<QuestionPaper>> getPendingPapers() {
        return ResponseEntity.ok(questionPaperService.getPendingPapers());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<QuestionPaper> updateStatus(
            @PathVariable("id") String id, 
            @RequestBody Map<String, Object> body) {
        
        String status = (String) body.get("status");
        Integer templateId = body.containsKey("templateId") ? (Integer) body.get("templateId") : null;
        
        try {
            return ResponseEntity.ok(questionPaperService.updateStatus(id, status, templateId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaper(@PathVariable("id") String id) {
        questionPaperService.deletePaper(id);
        return ResponseEntity.noContent().build();
    }
}
