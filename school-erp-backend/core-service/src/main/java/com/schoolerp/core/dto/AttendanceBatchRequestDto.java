package com.schoolerp.core.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceBatchRequestDto {
    private String classId;
    private LocalDate date;
    private String periodBlockId; // Optional depending on mode
    private String recordedBy; // User ID
    private String recordedRole; // TEACHER or ADMIN
    private List<AttendanceRecordDto> records;
}
