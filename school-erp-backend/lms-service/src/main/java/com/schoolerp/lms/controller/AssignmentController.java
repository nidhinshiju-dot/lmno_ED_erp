package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.Assignment;
import com.schoolerp.lms.entity.Submission;
import com.schoolerp.lms.service.AssignmentService;
import com.schoolerp.lms.repository.SubmissionRepository;
import com.schoolerp.lms.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @GetMapping("/course/{courseId}")
    public List<Assignment> getAssignmentsByCourseId(@PathVariable String courseId) {
        return assignmentService.getAssignmentsByCourseId(courseId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable String id) {
        return assignmentService.getAssignmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Assignment createAssignment(@Valid @RequestBody Assignment assignment) {
        return assignmentService.createAssignment(assignment);
    }

    /** A11 — Edit assignment */
    @PutMapping("/{id}")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable String id, @Valid @RequestBody Assignment body) {
        return assignmentService.getAssignmentById(id).map(a -> {
            a.setTitle(body.getTitle());
            a.setDescription(body.getDescription());
            a.setDueDate(body.getDueDate());
            a.setMaxScore(body.getMaxScore());
            return ResponseEntity.ok(assignmentRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** A12 — Delete assignment */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable String id) {
        if (assignmentService.getAssignmentById(id).isEmpty()) return ResponseEntity.notFound().build();
        
        // Prevent deletion if students have already submitted work
        if (!submissionRepository.findByAssignmentId(id).isEmpty()) {
             throw new org.springframework.dao.DataIntegrityViolationException("Cannot delete assignment. Students have already submitted work against it.");
        }
        
        assignmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{assignmentId}/submissions")
    public List<Submission> getSubmissions(@PathVariable String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<Submission> submit(@PathVariable String assignmentId, @Valid @RequestBody Submission submission) {
        var assignment = assignmentService.getAssignmentById(assignmentId);
        if (assignment.isEmpty()) return ResponseEntity.notFound().build();
        submission.setAssignment(assignment.get());
        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    @PatchMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable String submissionId, @Valid @RequestBody Map<String, Object> body) {
        return submissionRepository.findById(submissionId).map(sub -> {
            sub.setScore((Integer) body.get("score"));
            sub.setFeedback((String) body.get("feedback"));
            sub.setStatus("GRADED");
            sub.setGradedAt(LocalDateTime.now());
            return ResponseEntity.ok(submissionRepository.save(sub));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/submissions")
    public List<Submission> getStudentSubmissions(@PathVariable String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }
}
