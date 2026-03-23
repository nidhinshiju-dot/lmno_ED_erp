package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Parent;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.repository.ParentRepository;
import com.schoolerp.core.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<Parent>> getAllParents() {
        return ResponseEntity.ok(parentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parent> getParentById(@PathVariable UUID id) {
        return parentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<Student>> getStudentsByParent(@PathVariable UUID id) {
        return parentRepository.findById(id).map(parent -> {
            List<Student> students = studentRepository.findAll().stream()
                    .filter(s -> s.getParentId() != null && s.getParentId().equals(parent.getId().toString()))
                    .toList();
            return ResponseEntity.ok(students);
        }).orElse(ResponseEntity.notFound().build());
    }
}
