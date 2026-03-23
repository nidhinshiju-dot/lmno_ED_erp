package com.schoolerp.core.service;

import com.schoolerp.core.entity.ClassSubjectTeacher;
import com.schoolerp.core.entity.SchoolClass;
import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.entity.TeacherSchedule;
import com.schoolerp.core.repository.ClassSubjectTeacherRepository;
import com.schoolerp.core.repository.SchoolClassRepository;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.TeacherScheduleRepository;
import com.schoolerp.core.repository.StudentRepository;
import com.schoolerp.core.entity.Student;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherPortalService {

    private final StaffRepository staffRepository;
    private final TeacherScheduleRepository teacherScheduleRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ClassSubjectTeacherRepository classSubjectTeacherRepository;
    private final StudentRepository studentRepository;

    private Staff getStaffByUserId(String userId) {
        return staffRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("No Staff record found mapped to this user account."));
    }

    public List<TeacherSchedule> getMySchedule(String userId) {
        Staff currentTeacher = getStaffByUserId(userId);
        return teacherScheduleRepository.findByTeacherId(currentTeacher.getId());
    }

    public Map<String, Object> getMyClass(String userId) {
        Staff currentTeacher = getStaffByUserId(userId);
        SchoolClass homeroom = schoolClassRepository.findByClassTeacherId(currentTeacher.getId())
                .orElse(null);

        Map<String, Object> result = new HashMap<>();
        if (homeroom != null) {
            result.put("classDetails", homeroom);
            List<Student> students = studentRepository.findByClassIdAndIsActiveTrueOrderByNameAsc(homeroom.getId());
            result.put("students", students);
        } else {
            result.put("classDetails", null);
            result.put("students", List.of());
        }
        return result;
    }

    public List<ClassSubjectTeacher> getMySubjects(String userId) {
        Staff currentTeacher = getStaffByUserId(userId);
        return classSubjectTeacherRepository.findByTeacherId(currentTeacher.getId());
    }
}
