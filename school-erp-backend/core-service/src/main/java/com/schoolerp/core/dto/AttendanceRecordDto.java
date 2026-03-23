package com.schoolerp.core.dto;

import lombok.Data;

@Data
public class AttendanceRecordDto {
    private String studentId;
    private String statusId; // Must relate to AttendanceStatusType.code
    private String remarks;
}
