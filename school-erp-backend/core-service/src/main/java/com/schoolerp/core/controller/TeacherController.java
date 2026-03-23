package com.schoolerp.core.controller;

import com.schoolerp.core.entity.SchoolClass;
import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.repository.SchoolClassRepository;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import com.schoolerp.core.dto.ClassSubjectTeacherDto;
import com.schoolerp.core.service.ClassSubjectTeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final StaffRepository staffRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final StudentRepository studentRepository;
    private final ClassSubjectTeacherService classSubjectTeacherService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Staff> getProfile(@PathVariable String userId) {
        return staffRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{staffId}/classes")
    public ResponseEntity<List<SchoolClass>> getMyClasses(@PathVariable String staffId) {
        return schoolClassRepository.findByClassTeacherId(staffId)
                .map(sc -> ResponseEntity.ok(List.of(sc)))
                .orElse(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{staffId}/students")
    public ResponseEntity<List<Student>> getMyStudents(@PathVariable String staffId) {
        return ResponseEntity.ok(studentRepository.findAll()); // In production, filter by section
    }

    @GetMapping("/{userId}/assignments")
    public ResponseEntity<List<ClassSubjectTeacherDto>> getMyAssignments(@PathVariable String userId) {
        return staffRepository.findByUserId(userId)
                .map(staff -> ResponseEntity.ok(classSubjectTeacherService.getByTeacherId(staff.getId())))
                .orElse(ResponseEntity.notFound().build());
    }
}
