package com.schoolerp.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterialResponse {
    private String id;
    private String courseId;
    private String title;
    private String description;
    private String fileName;
    private Long fileSize;
    private String uploadedByUserId;
    private String uploadedByStaffId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
