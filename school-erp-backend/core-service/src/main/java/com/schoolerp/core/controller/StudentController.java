package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Student;
import com.schoolerp.core.service.StudentService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private static final Logger log = LoggerFactory.getLogger(StudentController.class);

    private static final String XLSX_CONTENT_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    @Autowired
    private StudentService studentService;

    /**
     * GET /api/v1/students/template
     * Returns a styled Excel (.xlsx) import template.
     * Content-Type:        application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     * Content-Disposition: attachment; filename="students_template.xlsx"
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // ── Sheet 1: Data entry sheet ─────────────────────────────────────
            XSSFSheet dataSheet = workbook.createSheet("Students");

            // Header style — bold, white text on dark blue background
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            XSSFFont headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 31, (byte) 73, (byte) 125}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.MEDIUM);

            // Data row style — light font, left-aligned
            XSSFCellStyle dataStyle = workbook.createCellStyle();
            XSSFFont dataFont = workbook.createFont();
            dataFont.setFontHeightInPoints((short) 10);
            dataStyle.setFont(dataFont);
            dataStyle.setAlignment(HorizontalAlignment.LEFT);

            // Column definitions: [header label, column width in units of 1/256 char]
            String[][] columns = {
                {"Full Name",        "5500"},
                {"Date of Birth",    "4000"},
                {"Parent Contact",   "4200"},
                {"Guardian Name",    "5000"},
                {"Relationship",     "3500"},
                {"Admission Number", "5000"},
            };

            // Write headers
            Row headerRow = dataSheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i][0]);
                cell.setCellStyle(headerStyle);
                dataSheet.setColumnWidth(i, Integer.parseInt(columns[i][1]));
            }

            // Freeze the header row
            dataSheet.createFreezePane(0, 1);

            // Sample data rows
            String[][] sampleRows = {
                {"Jane Doe",  "12-06-2015", "9876543210", "John Doe", "Father", ""},
                {"Alex Roy",  "01-09-2014", "9123456780", "Mary Roy", "Mother", ""},
            };
            for (int r = 0; r < sampleRows.length; r++) {
                Row row = dataSheet.createRow(r + 1);
                for (int c = 0; c < sampleRows[r].length; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellValue(sampleRows[r][c]);
                    cell.setCellStyle(dataStyle);
                }
            }

            // ── Sheet 2: Instructions ─────────────────────────────────────────
            XSSFSheet instrSheet = workbook.createSheet("Instructions");
            instrSheet.setColumnWidth(0, 10000);
            instrSheet.setColumnWidth(1, 12000);

            XSSFCellStyle instrHeaderStyle = workbook.createCellStyle();
            XSSFFont instrHeaderFont = workbook.createFont();
            instrHeaderFont.setBold(true);
            instrHeaderFont.setFontHeightInPoints((short) 11);
            instrHeaderStyle.setFont(instrHeaderFont);

            String[][] instructions = {
                {"Column",            "Rules"},
                {"Full Name",         "Required. Student's full legal name."},
                {"Date of Birth",     "Required. Format: dd-mm-yyyy (e.g. 15-03-2012)"},
                {"Parent Contact",    "Required. Numbers only, 7–15 digits, no spaces or symbols."},
                {"Guardian Name",     "Optional. Parent or guardian full name."},
                {"Relationship",      "Optional. Father / Mother / Guardian"},
                {"Admission Number",  "Optional. Leave blank to auto-generate."},
            };

            for (int i = 0; i < instructions.length; i++) {
                Row row = instrSheet.createRow(i);
                for (int c = 0; c < 2; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellValue(instructions[i][c]);
                    if (i == 0) cell.setCellStyle(instrHeaderStyle);
                }
            }

            // Serialize to byte array
            workbook.write(out);
            byte[] bytes = out.toByteArray();
            log.info("[template-download] Generated students_template.xlsx: {} bytes", bytes.length);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(XLSX_CONTENT_TYPE));
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_template.xlsx\"");
            headers.setContentLength(bytes.length);
            headers.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);

            return ResponseEntity.ok().headers(headers).body(bytes);

        } catch (Exception e) {
            log.error("[template-download] Failed to generate workbook", e);
            return ResponseEntity.internalServerError().build();
        }
    }


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
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
