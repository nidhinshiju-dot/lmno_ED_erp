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
public class SyllabusUploadResponse {
    private String id;
    private String courseId;
    private String title;
    private String description;
    private String fileName;
    private Long fileSize;
    private Integer version;
    private String uploadedByUserId;
    private String uploadedByStaffId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
