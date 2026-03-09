package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Exam;
import com.schoolerp.core.entity.ExamTemplate;
import com.schoolerp.core.entity.ExamTemplateSubject;
import com.schoolerp.core.service.ExamTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/exam-templates")
public class ExamTemplateController {

    @Autowired
    private ExamTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<ExamTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @PostMapping
    public ResponseEntity<ExamTemplate> createTemplate(@RequestBody ExamTemplate template) {
        return ResponseEntity.ok(templateService.createTemplate(template));
    }

    @GetMapping("/{id}/subjects")
    public ResponseEntity<List<ExamTemplateSubject>> getSubjects(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getSubjectsForTemplate(id));
    }

    @PostMapping("/{id}/subjects")
    public ResponseEntity<ExamTemplateSubject> addSubject(@PathVariable String id, @RequestBody ExamTemplateSubject subject) {
        subject.setTemplateId(id);
        return ResponseEntity.ok(templateService.addSubjectToTemplate(subject));
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<Exam> generateExam(
            @PathVariable("id") String templateId,
            @RequestBody Map<String, Object> payload) {
        String classId = (String) payload.get("classId");
        String examName = (String) payload.get("examName");
        LocalDate startDate = LocalDate.parse((String) payload.get("startDate"));
        
        Exam exam = templateService.generateExamFromTemplate(templateId, classId, examName, startDate);
        return ResponseEntity.ok(exam);
    }
}
