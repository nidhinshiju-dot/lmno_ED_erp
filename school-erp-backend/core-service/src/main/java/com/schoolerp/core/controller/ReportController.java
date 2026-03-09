package com.schoolerp.core.controller;

import com.schoolerp.core.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Autowired
    private com.schoolerp.core.service.PdfGenerationService pdfGenerationService;

    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> attendanceReport(
            @RequestParam String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getAttendanceReport(classId, from, to));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<Map<String, Object>> examReport(@PathVariable String examId) {
        return ResponseEntity.ok(reportService.getExamReport(examId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> studentReport(@PathVariable String studentId) {
        return ResponseEntity.ok(reportService.getStudentReport(studentId));
    }

    @GetMapping("/student/{studentId}/pdf")
    public ResponseEntity<byte[]> studentReportPdf(@PathVariable String studentId) {
        Map<String, Object> data = reportService.getStudentReport(studentId);
        byte[] pdf = pdfGenerationService.generateStudentReportPdf(data);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "student_report_" + studentId + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    // ── A15: CSV Export Endpoints ────────────────────────────────────────────

    /** Export attendance report as CSV */
    @GetMapping("/attendance/export/csv")
    public ResponseEntity<byte[]> exportAttendanceCsv(
            @RequestParam String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Map<String, Object> report = reportService.getAttendanceReport(classId, from, to);
        StringBuilder csv = new StringBuilder("Student ID,Student Name,Date,Status\n");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> records =
                (List<Map<String, Object>>) report.getOrDefault("records", List.of());
        for (Map<String, Object> row : records) {
            csv.append(row.getOrDefault("studentId", "")).append(",")
               .append(escapeCsv(String.valueOf(row.getOrDefault("studentName", "")))).append(",")
               .append(row.getOrDefault("date", "")).append(",")
               .append(row.getOrDefault("status", "")).append("\n");
        }

        return csvResponse(csv, "attendance_" + classId + "_" + from + "_" + to + ".csv");
    }

    /** Export student list as CSV */
    @GetMapping("/students/export/csv")
    public ResponseEntity<byte[]> exportStudentsCsv() {
        Map<String, Object> report = reportService.getStudentReport("all");
        StringBuilder csv = new StringBuilder("Student ID,Name,Admission No,Class,Status\n");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> students =
                (List<Map<String, Object>>) report.getOrDefault("students", List.of());
        for (Map<String, Object> s : students) {
            csv.append(s.getOrDefault("id", "")).append(",")
               .append(escapeCsv(String.valueOf(s.getOrDefault("fullName", "")))).append(",")
               .append(s.getOrDefault("admissionNumber", "")).append(",")
               .append(s.getOrDefault("className", "")).append(",")
               .append(s.getOrDefault("status", "")).append("\n");
        }

        return csvResponse(csv, "students_export.csv");
    }

    /** Export exam results as CSV with rank */
    @GetMapping("/exam/{examId}/export/csv")
    public ResponseEntity<byte[]> exportExamResultsCsv(@PathVariable String examId) {
        Map<String, Object> report = reportService.getExamReport(examId);
        StringBuilder csv = new StringBuilder("Student ID,Student Name,Marks Obtained,Total Marks,Grade,Class Rank\n");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results =
                (List<Map<String, Object>>) report.getOrDefault("results", List.of());
        for (Map<String, Object> r : results) {
            csv.append(r.getOrDefault("studentId", "")).append(",")
               .append(escapeCsv(String.valueOf(r.getOrDefault("studentName", "")))).append(",")
               .append(r.getOrDefault("marksObtained", "")).append(",")
               .append(r.getOrDefault("totalMarks", "")).append(",")
               .append(r.getOrDefault("grade", "")).append(",")
               .append(r.getOrDefault("classRank", "")).append("\n");
        }

        return csvResponse(csv, "exam_results_" + examId + ".csv");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> csvResponse(StringBuilder csv, String filename) {
        byte[] bytes = csv.toString().getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\n") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
