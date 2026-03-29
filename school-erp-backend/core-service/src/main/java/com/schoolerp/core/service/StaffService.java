package com.schoolerp.core.service;

import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.entity.SchoolClass;
import com.schoolerp.core.entity.ClassSubjectTeacher;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.SchoolClassRepository;
import com.schoolerp.core.repository.ClassSubjectTeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private ClassSubjectTeacherRepository classSubjectTeacherRepository;

    @Autowired
    private CredentialsService credentialsService;

    public List<Staff> getAllStaff() {
        return staffRepository.findByStatusNot("INACTIVE");
    }

    public Optional<Staff> getStaffById(String id) {
        return staffRepository.findById(id);
    }

    public Staff createStaff(Staff staff, String tenantId) {
        Staff savedStaff = staffRepository.save(staff);
        credentialsService.createStaffCredential(savedStaff, tenantId);
        return savedStaff;
    }

    @Transactional
    public void provisionLoginForStaff(String staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found."));
        if (staff.getUserId() != null && !staff.getUserId().isEmpty()) {
            throw new RuntimeException("Staff member already has an auth account provisioned.");
        }
        credentialsService.createStaffCredential(staff);
    }

    @org.springframework.beans.factory.annotation.Value("${SERVICE_AUTH_TOKEN:}")
    private String serviceAuthToken;

    @org.springframework.beans.factory.annotation.Value("${API_GATEWAY_URL:http://localhost:8080}")
    private String apiGatewayUrl;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(StaffService.class);
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    // ... inside deleteStaff, after saving INACTIVE status:
    @Transactional
    public void deleteStaff(String id) {
        // 1. Remove this staff from being a class teacher
        schoolClassRepository.findByClassTeacherId(id).ifPresent(sc -> {
            sc.setClassTeacherId(null);
            schoolClassRepository.save(sc);
        });

        // 2. Delete all subject assignments for this teacher
        List<ClassSubjectTeacher> subjectAssignments = classSubjectTeacherRepository.findByTeacherId(id);
        classSubjectTeacherRepository.deleteAll(subjectAssignments);

        // 3. Mark the staff member as INACTIVE instead of hard deleting
        staffRepository.findById(id).ifPresent(staff -> {
            staff.setStatus("INACTIVE");
            staffRepository.save(staff);

            if (staff.getUserId() != null && !staff.getUserId().trim().isEmpty()) {
                try {
                    org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                    headers.set("Authorization", "Bearer " + serviceAuthToken);
                    org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
                    
                    String url = apiGatewayUrl + "/api/v1/auth/users/" + staff.getUserId() + "/deactivate";
                    restTemplate.exchange(
                            url,
                            org.springframework.http.HttpMethod.PATCH,
                            entity,
                            Void.class
                    );
                    log.info("Successfully deactivated auth user for staff: {}", id);
                } catch (Exception e) {
                    log.error("Failed to deactivate auth user for staff {}: {}", id, e.getMessage());
                }
            }
        });
    }
}
