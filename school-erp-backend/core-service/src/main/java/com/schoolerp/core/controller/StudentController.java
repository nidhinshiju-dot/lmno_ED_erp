package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Student;
import com.schoolerp.core.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable("id") String id) {
        return studentService.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Student createStudent(@Valid @RequestBody Student student) {
        return studentService.createStudent(student);
    }

    @GetMapping("/parent/{parentId}")
    public List<Student> getByParentId(@PathVariable("parentId") String parentId) {
        return studentService.getByParentId(parentId);
    }

    @GetMapping("/status/{status}")
    public List<Student> getByStatus(@PathVariable("status") String status) {
        return studentService.getByStatus(status);
    }

    @GetMapping("/class/{classId}")
    public List<Student> getByClass(@PathVariable("classId") String classId) {
        return studentService.getByClassId(classId);
    }

    @GetMapping("/check-parent")
    public ResponseEntity<java.util.Map<String, String>> checkParent(@RequestParam("contact") String contact) {
        return studentService.getFirstStudentByParentContact(contact)
                .map(student -> {
                    java.util.Map<String, String> response = new java.util.HashMap<>();
                    response.put("parentId", student.getParentId());
                    response.put("guardianName", student.getGuardianName());
                    response.put("guardianRelation", student.getGuardianRelation());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable("id") String id, @Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Student> updateStatus(@PathVariable("id") String id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(studentService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<Student> transfer(@PathVariable("id") String id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(studentService.transferStudent(id, body.get("classId")));
    }

    @PostMapping("/promote")
    public ResponseEntity<List<Student>> promote(@Valid @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(studentService.promoteStudents(body.get("fromClassId"), body.get("toClassId")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        // Implementation stub added by QA Remediation
        return ResponseEntity.noContent().build();
    }
}
