package com.schoolerp.core.controller;

import com.schoolerp.core.entity.ClassSubjectTeacher;
import com.schoolerp.core.entity.TeacherSchedule;
import com.schoolerp.core.service.TeacherPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherPortalController {

    private final TeacherPortalService teacherPortalService;

    @GetMapping("/schedule")
    public ResponseEntity<List<TeacherSchedule>> getMySchedule(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(teacherPortalService.getMySchedule(userId));
    }

    @GetMapping("/my-class")
    public ResponseEntity<Map<String, Object>> getMyClass(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(teacherPortalService.getMyClass(userId));
    }

    @GetMapping("/my-subjects")
    public ResponseEntity<List<ClassSubjectTeacher>> getMySubjects(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(teacherPortalService.getMySubjects(userId));
    }
}
