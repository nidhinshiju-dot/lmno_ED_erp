package com.schoolerp.core.dto;

import lombok.Data;

@Data
public class NotificationPayload {
    private String title;
    private String message;
    private String scope; // ALL, CLASS, PARENTS, TEACHERS
    private String targetId; // classId if scope=CLASS
}
