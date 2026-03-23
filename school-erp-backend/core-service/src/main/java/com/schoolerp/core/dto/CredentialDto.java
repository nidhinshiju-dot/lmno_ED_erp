package com.schoolerp.core.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CredentialDto {
    private String id; // The actual core entity ID (Staff/Student ID)
    private String userId; // The Auth-Service User ID
    private String name; 
    private String username; 
    private String category; // TEACHER, STUDENT, PARENT
    private String contact; // Phone number or Admission Number
    private String status; // ACTIVE, INACTIVE
}
