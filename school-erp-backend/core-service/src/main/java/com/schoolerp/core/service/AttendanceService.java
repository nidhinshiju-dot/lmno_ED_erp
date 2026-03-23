package com.schoolerp.core.service;

import com.schoolerp.core.dto.AttendanceBatchRequestDto;
import com.schoolerp.core.dto.AttendanceRecordDto;
import com.schoolerp.core.dto.AttendanceStudentResponseDto;
import com.schoolerp.core.entity.Attendance;
import com.schoolerp.core.entity.AttendanceAuditLog;
import com.schoolerp.core.entity.SchoolSettings;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.repository.AttendanceAuditLogRepository;
import com.schoolerp.core.repository.AttendanceRepository;
import com.schoolerp.core.repository.SchoolSettingsRepository;
import com.schoolerp.core.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;
import com.schoolerp.core.entity.AttendanceStatusType;
import com.schoolerp.core.repository.AttendanceStatusTypeRepository;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceAuditLogRepository auditLogRepository;
    private final StudentRepository studentRepository;
    private final SchoolSettingsRepository settingsRepository;
    private final AttendanceStatusTypeRepository statusTypeRepository;

    @PostConstruct
    public void initDefaultStatuses() {
        if (statusTypeRepository.count() == 0) {
            statusTypeRepository.save(new AttendanceStatusType(null, "PRESENT", "Present", true, "green"));
            statusTypeRepository.save(new AttendanceStatusType(null, "ABSENT", "Absent", true, "red"));
            statusTypeRepository.save(new AttendanceStatusType(null, "LATE", "Late Entry", true, "amber"));
            statusTypeRepository.save(new AttendanceStatusType(null, "LEAVE", "On Leave", true, "blue"));
            statusTypeRepository.save(new AttendanceStatusType(null, "MEDICAL", "Medical Leave", true, "purple"));
            statusTypeRepository.save(new AttendanceStatusType(null, "HALF_DAY", "Half Day", true, "orange"));
        }
    }

    /**
     * Gets the current Attendance Mode (DAILY or PERIOD)
     */
    public String getAttendanceMode() {
        return settingsRepository.findAll().stream().findFirst()
                .map(SchoolSettings::getAttendanceMode)
                .orElse("DAILY");
    }

    /**
     * Retrieve a list of students for a class, augmenting with existing attendance records if available.
     */
    public List<AttendanceStudentResponseDto> getClassRosterForAttendance(String classId, LocalDate date, String periodBlockId) {
        String mode = getAttendanceMode();
        
        List<Student> students = studentRepository.findByClassIdAndIsActiveTrueOrderByNameAsc(classId);
        
        // Fetch existing attendance
        List<Attendance> existingAtt;
        if ("PERIOD".equals(mode) && periodBlockId != null) {
            existingAtt = attendanceRepository.findByClassIdAndDateAndPeriodBlockId(classId, date, periodBlockId);
        } else {
            existingAtt = attendanceRepository.findByClassIdAndDate(classId, date);
        }

        Map<String, Attendance> attMap = existingAtt.stream()
                .collect(Collectors.toMap(Attendance::getStudentId, a -> a));

        List<AttendanceStudentResponseDto> response = new ArrayList<>();
        for (Student s : students) {
            AttendanceStudentResponseDto dto = new AttendanceStudentResponseDto(
                    s.getId(),
                    s.getAdmissionNumber(),
                    s.getName(),
                    null, null, null
            );

            if (attMap.containsKey(s.getId())) {
                Attendance att = attMap.get(s.getId());
                dto.setAttendanceId(att.getId());
                dto.setStatusId(att.getStatus());
                dto.setRemarks(att.getRemarks());
            }

            response.add(dto);
        }
        
        return response;
    }

    /**
     * Process a batch submission of attendance. Validates role constraints and generates audit logs.
     */
    @Transactional
    public void submitAttendanceBatch(AttendanceBatchRequestDto dto) {
        String mode = getAttendanceMode();
        LocalDate now = LocalDate.now();
        
        // 1. Validate Teacher Date constraint
        if ("TEACHER".equalsIgnoreCase(dto.getRecordedRole())) {
            if (dto.getDate().isBefore(now)) {
                throw new IllegalArgumentException("Teachers cannot edit past attendance records.");
            }
        }
        
        if (dto.getDate().isAfter(now)) {
            throw new IllegalArgumentException("Cannot mark attendance for future dates.");
        }

        for (AttendanceRecordDto record : dto.getRecords()) {
            Optional<Attendance> existingOpt;
            if ("PERIOD".equals(mode) && dto.getPeriodBlockId() != null) {
                existingOpt = attendanceRepository.findByStudentIdAndDateAndPeriodBlockId(
                        record.getStudentId(), dto.getDate(), dto.getPeriodBlockId());
            } else {
                List<Attendance> currentList = attendanceRepository.findByClassIdAndDate(dto.getClassId(), dto.getDate());
                existingOpt = currentList.stream().filter(a -> a.getStudentId().equals(record.getStudentId())).findFirst();
            }

            Attendance attendance;
            String oldStatus = null;

            if (existingOpt.isPresent()) {
                attendance = existingOpt.get();
                oldStatus = attendance.getStatus();
                
                // If unchanged, skip
                if (oldStatus.equals(record.getStatusId()) && 
                    (attendance.getRemarks() == null ? record.getRemarks() == null : attendance.getRemarks().equals(record.getRemarks()))) {
                    continue; 
                }
                
                attendance.setStatus(record.getStatusId());
                attendance.setRemarks(record.getRemarks());
                attendance.setRecordedBy(dto.getRecordedBy());
                attendance.setRecordedRole(dto.getRecordedRole());
            } else {
                attendance = new Attendance();
                attendance.setStudentId(record.getStudentId());
                attendance.setClassId(dto.getClassId());
                attendance.setDate(dto.getDate());
                attendance.setPeriodBlockId("PERIOD".equals(mode) ? dto.getPeriodBlockId() : null);
                attendance.setStatus(record.getStatusId());
                attendance.setRemarks(record.getRemarks());
                attendance.setRecordedBy(dto.getRecordedBy());
                attendance.setRecordedRole(dto.getRecordedRole());
            }

            Attendance saved = attendanceRepository.save(attendance);

            // Audit Log
            AttendanceAuditLog audit = new AttendanceAuditLog();
            audit.setAttendanceId(saved.getId());
            audit.setStudentId(saved.getStudentId());
            audit.setChangedByUserId(dto.getRecordedBy() != null ? dto.getRecordedBy() : "SYSTEM");
            audit.setUserRole(dto.getRecordedRole() != null ? dto.getRecordedRole() : "SYSTEM");
            audit.setOldStatus(oldStatus);
            audit.setNewStatus(saved.getStatus());
            audit.setTimestamp(LocalDateTime.now());
            auditLogRepository.save(audit);
        }
    }
}
