package com.schoolerp.core.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
public class PdfGenerationService {

    public byte[] generateStudentReportPdf(Map<String, Object> reportData) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Student Academic Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Basic Info
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            document.add(new Paragraph("Student ID: " + reportData.get("studentId"), normalFont));
            document.add(new Paragraph("Student Name: " + reportData.get("studentName"), normalFont));
            document.add(new Paragraph("Report Generated: " + java.time.LocalDate.now(), normalFont));
            document.add(new Paragraph(" ", normalFont));

            // Summary Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            addTableCell(table, "Total Exams Taken", true);
            addTableCell(table, String.valueOf(reportData.get("totalExams")), false);

            addTableCell(table, "Average Exam Marks", true);
            addTableCell(table, reportData.get("averageMarks") + " %", false);

            addTableCell(table, "Total Attendance Days", true);
            addTableCell(table, String.valueOf(reportData.get("totalAttendanceDays")), false);

            addTableCell(table, "Present Days", true);
            addTableCell(table, String.valueOf(reportData.get("presentDays")), false);

            addTableCell(table, "Attendance Rate", true);
            addTableCell(table, reportData.get("attendanceRate") + " %", false);

            document.add(table);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }

    private void addTableCell(PdfPTable table, String text, boolean isHeader) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(isHeader ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA)));
        cell.setPadding(8);
        table.addCell(cell);
    }
}
