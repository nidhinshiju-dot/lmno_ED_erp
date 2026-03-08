package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Section;
import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.repository.SectionRepository;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final StaffRepository staffRepository;
    private final SectionRepository sectionRepository;
    private final StudentRepository studentRepository;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Staff> getProfile(@PathVariable String userId) {
        return staffRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{staffId}/sections")
    public ResponseEntity<List<Section>> getMySections(@PathVariable String staffId) {
        return ResponseEntity.ok(sectionRepository.findByClassTeacherId(staffId));
    }

    @GetMapping("/{staffId}/students")
    public ResponseEntity<List<Student>> getMyStudents(@PathVariable String staffId) {
        return ResponseEntity.ok(studentRepository.findAll()); // In production, filter by section
    }
}
