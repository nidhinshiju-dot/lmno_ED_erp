package com.schoolerp.core.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStudentResponseDto {
    private String studentId;
    private String admissionNumber;
    private String name;
    
    // Previous attendance details if exist
    private String attendanceId;
    private String statusId; // PRESENT, ABSENT etc. mapped to AttendanceStatusType.code
    private String remarks;
}
