package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Attendance;
import com.schoolerp.core.repository.AttendanceRepository;
import com.schoolerp.core.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Attendance>> getByClass(
            @PathVariable String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getByClassAndDate(classId, date));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getByStudentId(studentId));
    }

    @PostMapping
    public ResponseEntity<List<Attendance>> markAttendance(@RequestBody List<Attendance> records) {
        return ResponseEntity.ok(attendanceService.markAttendance(records));
    }

    /**
     * B9 — Edit an attendance record.
     * Allows correcting a previously marked status or remarks.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable String id, @RequestBody Attendance body) {
        return attendanceRepository.findById(id).map(a -> {
            a.setStatus(body.getStatus());
            a.setRemarks(body.getRemarks());
            return ResponseEntity.ok(attendanceRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * B10 — Monthly attendance summary for a student.
     * Returns a map of month (YYYY-MM) to counts: {PRESENT: N, ABSENT: N, LATE: N}
     */
    @GetMapping("/student/{studentId}/monthly")
    public ResponseEntity<Map<String, Map<String, Long>>> getMonthlyAttendance(
            @PathVariable String studentId) {
        List<Attendance> records = attendanceService.getByStudentId(studentId);

        // Group by YYYY-MM then by status and count
        Map<String, Map<String, Long>> summary = records.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        TreeMap::new,
                        Collectors.groupingBy(Attendance::getStatus, Collectors.counting())
                ));

        return ResponseEntity.ok(summary);
    }
}
