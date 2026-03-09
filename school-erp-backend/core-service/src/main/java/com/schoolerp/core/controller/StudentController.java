package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Student;
import com.schoolerp.core.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public Student createStudent(@RequestBody Student student) {
        return studentService.createStudent(student);
    }

    @GetMapping("/parent/{parentId}")
    public List<Student> getByParentId(@PathVariable String parentId) {
        return studentService.getByParentId(parentId);
    }

    @GetMapping("/status/{status}")
    public List<Student> getByStatus(@PathVariable String status) {
        return studentService.getByStatus(status);
    }

    @GetMapping("/class/{classId}")
    public List<Student> getByClass(@PathVariable String classId) {
        return studentService.getByClassId(classId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Student> updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(studentService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<Student> transfer(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(studentService.transferStudent(id, body.get("classId")));
    }

    @PostMapping("/promote")
    public ResponseEntity<List<Student>> promote(@RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(studentService.promoteStudents(body.get("fromClassId"), body.get("toClassId")));
    }
}
