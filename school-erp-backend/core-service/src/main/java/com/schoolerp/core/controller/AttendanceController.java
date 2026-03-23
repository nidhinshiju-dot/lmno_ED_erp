package com.schoolerp.core.controller;

import com.schoolerp.core.dto.AttendanceBatchRequestDto;
import com.schoolerp.core.dto.AttendanceStudentResponseDto;
import com.schoolerp.core.entity.AttendanceStatusType;
import com.schoolerp.core.repository.AttendanceStatusTypeRepository;
import com.schoolerp.core.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceStatusTypeRepository statusTypeRepository;

    /**
     * Get active attendance mode (DAILY vs PERIOD)
     */
    @GetMapping("/mode")
    public ResponseEntity<String> getMode() {
        return ResponseEntity.ok(attendanceService.getAttendanceMode());
    }

    /**
     * Get custom Status Types (Present, Absent, Leave)
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<AttendanceStatusType>> getStatuses() {
        return ResponseEntity.ok(statusTypeRepository.findAll());
    }

    /**
     * Get dynamic Class roster augmented with attendance data for a given date
     */
    @GetMapping("/roster")
    public ResponseEntity<List<AttendanceStudentResponseDto>> getClassRoster(
            @RequestParam("classId") String classId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "periodBlockId", required = false) String periodBlockId) {
        
        return ResponseEntity.ok(attendanceService.getClassRosterForAttendance(classId, date, periodBlockId));
    }

    /**
     * Submit Bulk/Batch Attendance for a Class/Period
     */
    @PostMapping("/batch")
    public ResponseEntity<String> submitBatch(@RequestBody AttendanceBatchRequestDto request) {
        try {
            attendanceService.submitAttendanceBatch(request);
            return ResponseEntity.ok("Attendance recorded successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
