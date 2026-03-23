package com.schoolerp.core.service;

import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.entity.Parent;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.StudentRepository;
import com.schoolerp.core.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class CredentialsService {

    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    
    // Auth-Service is routed directly via docker container hostname
    private static final String AUTH_REGISTER_URL = "http://erp-uat-auth:8081/api/v1/auth/register";
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public boolean createStaffCredential(Staff s) {
        return createStaffCredential(s, null);
    }

    @Transactional
    public boolean createStaffCredential(Staff s, String tenantId) {
        if (s.getUserId() == null || s.getUserId().isEmpty()) {
            // Generate system username: teacher{firstname}{random}@{schoolname}.com
            String firstName = (s.getName() != null && !s.getName().isBlank())
                    ? s.getName().trim().split("\\s+")[0].toLowerCase().replaceAll("[^a-z0-9]", "")
                    : "teacher";
            int randomNum = java.util.concurrent.ThreadLocalRandom.current().nextInt(1000, 9999);
            String schoolDomain = (tenantId != null && !tenantId.isBlank()) ? tenantId.toLowerCase() : "school";
            String generatedEmail = "teacher" + firstName + randomNum + "@" + schoolDomain + ".com";

            String userId = createUserInAuthService(generatedEmail, "Temporary123!", "TEACHER", tenantId);
            if (userId != null) {
                // Store the generated username as the staff email if none exists
                if (s.getEmail() == null || s.getEmail().isBlank()) {
                    s.setEmail(generatedEmail);
                }
                s.setUserId(userId);
                staffRepository.save(s);
                log.info("Created auth user for staff {} with username: {}", s.getName(), generatedEmail);
                return true;
            }
        }
        return false;
    }


    @Transactional
    public boolean createParentCredential(Parent p) {
        if (p.getUserId() == null) {
            String userId = createUserInAuthService(p.getPhoneNumber(), "ParentPass123!", "PARENT");
            if (userId != null) {
                p.setUserId(java.util.UUID.fromString(userId));
                parentRepository.save(p);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public boolean createStudentCredential(Student st) {
        if (st.getUserId() == null || st.getUserId().isEmpty()) {
            String dobStr = (st.getDob() != null) ? st.getDob().toString().replace("-", "") : "123456";
            String username = (st.getAdmissionNumber() != null) ? st.getAdmissionNumber() : "STU" + st.getId().substring(0,6);
            String userId = createUserInAuthService(username, dobStr, "STUDENT");
            if (userId != null) {
                st.setUserId(userId);
                studentRepository.save(st);
                return true;
            }
        }
        return false;
    }

    private static final String AUTH_PROVISION_URL = "http://erp-uat-auth:8081/api/v1/auth/provision";

    private String createUserInAuthService(String email, String password, String role) {
        return createUserInAuthService(email, password, role, null);
    }

    private String createUserInAuthService(String email, String password, String role, String tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            String tenantPart = (tenantId != null) ? String.format(", \"tenantId\": \"%s\"", tenantId) : "";
            String requestBody = String.format(
                "{\"email\": \"%s\", \"password\": \"%s\", \"role\": \"%s\"%s}",
                email, password, role, tenantPart
            );
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(AUTH_PROVISION_URL, HttpMethod.POST, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("User {} provisioned successfully in Auth-Service with role {}", email, role);
                return (String) response.getBody().get("id");
            } else {
                log.error("Failed to provision user {} in Auth-Service. Status: {}", email, response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error provisioning user {} in Auth-Service: {}", email, e.getMessage());
            return null;
        }
    }

    public List<com.schoolerp.core.dto.CredentialDto> getCredentials(String type) {
        List<com.schoolerp.core.dto.CredentialDto> results = new java.util.ArrayList<>();
        
        if ("teachers".equalsIgnoreCase(type)) {
            List<Staff> staffList = staffRepository.findAll();
            for (Staff s : staffList) {
                com.schoolerp.core.dto.CredentialDto dto = new com.schoolerp.core.dto.CredentialDto();
                dto.setId(s.getId());
                dto.setUserId(s.getUserId());
                dto.setName(s.getName());
                dto.setCategory("TEACHER");
                dto.setContact(s.getPhone() != null ? s.getPhone() : s.getEmail());
                dto.setStatus(s.getStatus() != null ? s.getStatus() : "ACTIVE");
                dto.setUsername((s.getPhone() != null && !s.getPhone().isEmpty()) ? s.getPhone() : s.getEmployeeId());
                results.add(dto);
            }
        } else if ("students".equalsIgnoreCase(type)) {
            List<Student> students = studentRepository.findAll();
            for (Student st : students) {
                com.schoolerp.core.dto.CredentialDto dto = new com.schoolerp.core.dto.CredentialDto();
                dto.setId(st.getId());
                dto.setUserId(st.getUserId());
                dto.setName(st.getName());
                dto.setCategory("STUDENT");
                dto.setContact(st.getAdmissionNumber());
                dto.setStatus(st.getStatus() != null ? st.getStatus() : "ACTIVE");
                dto.setUsername(st.getAdmissionNumber());
                results.add(dto);
            }
        } else if ("parents".equalsIgnoreCase(type)) {
            List<Parent> parents = parentRepository.findAll();
            for (Parent p : parents) {
                com.schoolerp.core.dto.CredentialDto dto = new com.schoolerp.core.dto.CredentialDto();
                dto.setId(p.getId() != null ? p.getId().toString() : "");
                dto.setUserId(p.getUserId() != null ? p.getUserId().toString() : null);
                dto.setName(p.getName());
                dto.setCategory("PARENT");
                dto.setContact(p.getPhoneNumber());
                dto.setStatus("ACTIVE");
                dto.setUsername(p.getPhoneNumber());
                results.add(dto);
            }
        }
        
        return results;
    }
}
