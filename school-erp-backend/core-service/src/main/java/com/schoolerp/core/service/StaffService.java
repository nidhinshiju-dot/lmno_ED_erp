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
        boolean provisioned = credentialsService.createStaffCredential(staff);
        if (!provisioned) {
            throw new RuntimeException("Failed to provision auth account.");
        }
    }

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
        });
    }
}
