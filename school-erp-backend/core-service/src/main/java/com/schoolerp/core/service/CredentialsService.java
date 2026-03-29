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
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;

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
    private final com.schoolerp.core.repository.SchoolRepository schoolRepository;
    
    // Auth-Service is routed directly via docker container hostname (internal service-to-service, not via gateway)
    @org.springframework.beans.factory.annotation.Value("${AUTH_SERVICE_URL:http://auth-service:8081}")
    private String authServiceBaseUrl;
    private final RestTemplate restTemplate = new RestTemplate();


    @Async
    @Transactional
    public void createStaffCredential(Staff paramStaff) {
        createStaffCredential(paramStaff, null);
    }

    @Async
    @Transactional
    public void createStaffCredential(Staff paramStaff, String tenantId) {
        Staff s = staffRepository.findById(paramStaff.getId()).orElse(null);
        if (s == null) return;

        if (s.getUserId() == null || s.getUserId().isEmpty()) {
            s.setProvisioningStatus("PENDING");
            s.setLastProvisionAttemptAt(java.time.LocalDateTime.now());
            
            String firstName = (s.getName() != null && !s.getName().isBlank())
                    ? s.getName().trim().split("\\s+")[0].toLowerCase().replaceAll("[^a-z0-9]", "")
                    : "teacher";
            int randomNum = java.util.concurrent.ThreadLocalRandom.current().nextInt(1000, 9999);
            String schoolDomain = (tenantId != null && !tenantId.isBlank()) ? tenantId.toLowerCase() : "school";
            String generatedEmail = "teacher" + firstName + randomNum + "@" + schoolDomain + ".com";

            String refId = s.getId() != null ? String.valueOf(s.getId()) : null;
            String userId = createUserInAuthService(generatedEmail, "TEACHER", tenantId, refId);
            if (userId != null) {
                if (s.getEmail() == null || s.getEmail().isBlank()) {
                    s.setEmail(generatedEmail);
                }
                s.setUserId(userId);
                s.setProvisioningStatus("PROVISIONED");
                s.setProvisionedAt(java.time.LocalDateTime.now());
                s.setProvisioningError(null);
                log.info("Created auth user for staff {} with username: {}", s.getName(), generatedEmail);
            } else {
                s.setProvisioningStatus("FAILED");
                s.setProvisioningError("Auth service failed or returned null");
                log.error("Failed to provision auth user for staff {}", s.getName());
            }
            staffRepository.save(s);
        }
    }


    @Async
    @Transactional
    public void createParentCredential(Parent paramParent) {
        Parent p = parentRepository.findById(paramParent.getId()).orElse(null);
        if (p == null) return;
        
        if (p.getUserId() == null) {
            p.setProvisioningStatus("PENDING");
            p.setLastProvisionAttemptAt(java.time.LocalDateTime.now());
            
            String refId = p.getId() != null ? String.valueOf(p.getId()) : null;
            String userId = createUserInAuthService(p.getPhoneNumber(), "PARENT", null, refId);
            if (userId != null) {
                p.setUserId(java.util.UUID.fromString(userId));
                p.setProvisioningStatus("PROVISIONED");
                p.setProvisionedAt(java.time.LocalDateTime.now());
                p.setProvisioningError(null);
            } else {
                p.setProvisioningStatus("FAILED");
                p.setProvisioningError("Auth service failed or returned null");
            }
            parentRepository.save(p);
        }
    }

    @Async
    @Transactional
    public void createStudentCredential(Student paramStudent) {
        Student st = studentRepository.findById(paramStudent.getId()).orElse(null);
        if (st == null) return;
        
        if (st.getUserId() == null || st.getUserId().isEmpty()) {
            st.setProvisioningStatus("PENDING");
            st.setLastProvisionAttemptAt(java.time.LocalDateTime.now());
            
            String username = (st.getAdmissionNumber() != null) ? st.getAdmissionNumber() : "STU" + st.getId().substring(0,6);
            String refId = st.getId() != null ? String.valueOf(st.getId()) : null;
            String userId = createUserInAuthService(username, "STUDENT", null, refId);
            if (userId != null) {
                st.setUserId(userId);
                st.setProvisioningStatus("PROVISIONED");
                st.setProvisionedAt(java.time.LocalDateTime.now());
                st.setProvisioningError(null);
            } else {
                st.setProvisioningStatus("FAILED");
                st.setProvisioningError("Auth service failed or returned null");
            }
            studentRepository.save(st);
        }
    }

    @Async
    @Transactional
    public void createSchoolAdminCredential(com.schoolerp.core.entity.School paramSchool) {
        com.schoolerp.core.entity.School s = schoolRepository.findById(paramSchool.getId()).orElse(null);
        if (s == null) return;
        
        s.setProvisioningStatus("PENDING");
        s.setLastProvisionAttemptAt(java.time.LocalDateTime.now());
        
        String userId = createUserInAuthService(s.getContactEmail(), "ADMIN", s.getId(), null);
        if (userId != null) {
            s.setProvisioningStatus("PROVISIONED");
            s.setProvisionedAt(java.time.LocalDateTime.now());
            s.setProvisioningError(null);
        } else {
            s.setProvisioningStatus("FAILED");
            s.setProvisioningError("Auth service failed or returned null");
        }
        schoolRepository.save(s);
    }
    
    @Scheduled(fixedDelay = 300000)
    public void retryFailedProvisioning() {
        log.info("Starting scheduled retry for failed provisioning...");
        
        // Find staff
        List<Staff> failedStaff = staffRepository.findAll().stream()
                .filter(stf -> "FAILED".equals(stf.getProvisioningStatus()))
                .toList();
        for (Staff staff : failedStaff) {
            createStaffCredential(staff);
        }
        
        // Find students
        List<Student> failedStudents = studentRepository.findAll().stream()
                .filter(stu -> "FAILED".equals(stu.getProvisioningStatus()))
                .toList();
        for (Student student : failedStudents) {
            createStudentCredential(student);
        }
        
        // Find parents
        List<Parent> failedParents = parentRepository.findAll().stream()
                .filter(par -> "FAILED".equals(par.getProvisioningStatus()))
                .toList();
        for (Parent parent : failedParents) {
            createParentCredential(parent);
        }
        
        // Find schools
        List<com.schoolerp.core.entity.School> failedSchools = schoolRepository.findAll().stream()
                .filter(sch -> "FAILED".equals(sch.getProvisioningStatus()))
                .toList();
        for (com.schoolerp.core.entity.School school : failedSchools) {
            createSchoolAdminCredential(school);
        }
        
        log.info("Completed scheduled retry for failed provisioning.");
    }

    private static final String AUTH_PROVISION_PATH = "/api/v1/auth/provision";


    private String createUserInAuthService(String email, String role, String tenantId, String referenceId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            String tenantPart = (tenantId != null) ? String.format(", \"tenantId\": \"%s\"", tenantId) : "";
            String refPart = (referenceId != null) ? String.format(", \"referenceId\": \"%s\"", referenceId) : "";
            String requestBody = String.format(
                "{\"email\": \"%s\", \"role\": \"%s\"%s%s}",
                email, role, tenantPart, refPart
            );
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(authServiceBaseUrl + AUTH_PROVISION_PATH, HttpMethod.POST, request, Map.class);
            log.info("Provision request - email: {}, tenantId: {}, response status: {}", email, tenantId, response.getStatusCode());


            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String generatedPassword = (String) response.getBody().get("temporaryPassword");
                log.info("User {} provisioned successfully in Auth-Service with role {} [Password generated locally by auth]", email, role);
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
