package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Student;
import com.schoolerp.core.service.StudentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final StudentService studentService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatRequest request) {
        String message = request.getMessage().toLowerCase().trim();
        Map<String, Object> response = new HashMap<>();

        if (message.contains("register") && message.contains("student")) {
            response.put("type", "action");
            response.put("action", "OPEN_STUDENT_REGISTRATION");
            response.put("message", "Sure! I'll open the student registration form for you.");
        } else if (message.contains("show students") || message.contains("list students") || message.contains("all students")) {
            List<Student> students = studentService.getAllStudents();
            response.put("type", "data");
            response.put("message", "Here are all " + students.size() + " students in the system:");
            response.put("data", students);
        } else if (message.contains("assign") && message.contains("teacher")) {
            response.put("type", "action");
            response.put("action", "OPEN_TEACHER_ASSIGNMENT");
            response.put("message", "Opening the class teacher assignment page for you.");
        } else if (message.contains("fee") || message.contains("invoice")) {
            response.put("type", "action");
            response.put("action", "NAVIGATE_FEES");
            response.put("message", "Navigating to the Fee Management page.");
        } else {
            response.put("type", "text");
            response.put("message", "I can help you with:\n• \"Register a new student\"\n• \"Show students\"\n• \"Assign class teacher\"\n• \"Show fees\"\n\nTry one of these commands!");
        }

        return ResponseEntity.ok(response);
    }
}

@Data
class ChatRequest {
    private String message;
}
