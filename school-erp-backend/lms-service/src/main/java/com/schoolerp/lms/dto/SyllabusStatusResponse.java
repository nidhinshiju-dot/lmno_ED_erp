package com.schoolerp.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusStatusResponse {
    private String courseId;
    private String courseName;
    private String teacherId;
    private String classId;
    private String status;
    private Integer latestVersion;
    private String uploadedBy;
    private LocalDateTime updatedAt;
}
