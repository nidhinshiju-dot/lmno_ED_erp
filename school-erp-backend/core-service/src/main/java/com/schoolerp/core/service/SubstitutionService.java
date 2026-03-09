package com.schoolerp.core.service;

import com.schoolerp.core.dto.SubstitutionDto;
import com.schoolerp.core.entity.Substitution;
import com.schoolerp.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubstitutionService {

    private final SubstitutionRepository substitutionRepository;
    private final TeacherScheduleRepository teacherScheduleRepository;
    private final StaffRepository staffRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final PeriodBlockRepository periodBlockRepository;
    private final SubjectRepository subjectRepository;

    public List<SubstitutionDto> getByDate(LocalDate date) {
        return substitutionRepository.findByDate(date).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public Substitution create(Substitution sub) {
        sub.setStatus("SUGGESTED");
        return substitutionRepository.save(sub);
    }

    public Substitution confirm(String id, String substituteTeacherId) {
        return substitutionRepository.findById(id).map(sub -> {
            sub.setSubstituteTeacherId(substituteTeacherId);
            sub.setStatus("CONFIRMED");
            return substitutionRepository.save(sub);
        }).orElseThrow(() -> new RuntimeException("Substitution not found: " + id));
    }

    public void cancel(String id) {
        substitutionRepository.findById(id).ifPresent(sub -> {
            sub.setStatus("CANCELLED");
            substitutionRepository.save(sub);
        });
    }

    /**
     * Find available substitute teachers for a given class/block/date.
     * Returns teachers who teach the same subject AND are free at this block.
     */
    public List<Map<String, String>> suggestSubstitutes(
            String timetableId, String originalTeacherId, String blockId, LocalDate date) {

        // Find what the original teacher teaches in this block (logged for audit)
        teacherScheduleRepository
                .findByTimetableIdAndTeacherId(timetableId, originalTeacherId)
                .stream().filter(ts -> ts.getBlockId().equals(blockId))
                .collect(Collectors.toList());

        // Find all teachers who are free at this block
        List<Map<String, String>> suggestions = new ArrayList<>();
        staffRepository.findAll().forEach(staff -> {
            if (staff.getId().equals(originalTeacherId))
                return;
            boolean isBusy = teacherScheduleRepository.findByTeacherId(staff.getId())
                    .stream().anyMatch(ts -> ts.getBlockId().equals(blockId));
            if (!isBusy) {
                Map<String, String> suggestion = new HashMap<>();
                suggestion.put("teacherId", staff.getId());
                suggestion.put("teacherName", staff.getName());
                suggestion.put("email", staff.getEmail() != null ? staff.getEmail() : "");
                suggestions.add(suggestion);
            }
        });
        return suggestions;
    }

    private SubstitutionDto toDto(Substitution sub) {
        SubstitutionDto dto = new SubstitutionDto();
        dto.setId(sub.getId());
        dto.setDate(sub.getDate().toString());
        dto.setClassId(sub.getClassId());
        dto.setBlockId(sub.getBlockId());
        dto.setSubjectId(sub.getSubjectId());
        dto.setOriginalTeacherId(sub.getOriginalTeacherId());
        dto.setSubstituteTeacherId(sub.getSubstituteTeacherId());
        dto.setStatus(sub.getStatus());
        dto.setReason(sub.getReason());

        schoolClassRepository.findById(sub.getClassId()).ifPresent(c -> dto.setClassName(c.getName()));
        periodBlockRepository.findById(sub.getBlockId()).ifPresent(b -> dto.setBlockName(b.getBlockName()));
        if (sub.getSubjectId() != null)
            subjectRepository.findById(sub.getSubjectId()).ifPresent(s -> dto.setSubjectName(s.getName()));
        staffRepository.findById(sub.getOriginalTeacherId())
                .ifPresent(t -> dto.setOriginalTeacherName(t.getName()));
        if (sub.getSubstituteTeacherId() != null)
            staffRepository.findById(sub.getSubstituteTeacherId())
                    .ifPresent(t -> dto.setSubstituteTeacherName(t.getName()));
        return dto;
    }
}
