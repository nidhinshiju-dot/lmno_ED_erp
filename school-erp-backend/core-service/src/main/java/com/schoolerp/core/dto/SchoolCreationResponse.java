package com.schoolerp.core.dto;

import com.schoolerp.core.entity.School;
import lombok.Data;

@Data
public class SchoolCreationResponse {
    private School school;
    private String adminEmail;
    private String tempPassword;
    private String tenantId;
    private String loginUrl;

    public SchoolCreationResponse(School school, String adminEmail, String tempPassword) {
        this.school = school;
        this.adminEmail = adminEmail;
        this.tempPassword = tempPassword;
        this.tenantId = school.getId();
        this.loginUrl = "http://localhost:3000";
    }
}
