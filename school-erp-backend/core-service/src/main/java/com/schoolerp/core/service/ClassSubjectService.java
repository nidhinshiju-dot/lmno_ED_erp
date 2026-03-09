package com.schoolerp.core.service;

import com.schoolerp.core.dto.ClassSubjectDto;
import com.schoolerp.core.entity.ClassSubject;
import com.schoolerp.core.repository.ClassSubjectRepository;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassSubjectService {

    private final ClassSubjectRepository classSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;

    public List<ClassSubjectDto> getSubjectsByClassId(String classId) {
        List<ClassSubject> mappings = classSubjectRepository.findByClassId(classId);
        return mappings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ClassSubject assignSubjectToClass(ClassSubject classSubject) {
        // Prevent duplicate assignment
        Optional<ClassSubject> existing = classSubjectRepository.findByClassIdAndSubjectId(classSubject.getClassId(),
                classSubject.getSubjectId());
        if (existing.isPresent()) {
            throw new RuntimeException("Subject is already assigned to this class.");
        }
        return classSubjectRepository.save(classSubject);
    }

    public ClassSubject updateAssignment(String id, ClassSubject updated) {
        return classSubjectRepository.findById(id).map(cs -> {
            cs.setTeacherId(updated.getTeacherId());
            cs.setPeriodsPerWeek(updated.getPeriodsPerWeek());
            return classSubjectRepository.save(cs);
        }).orElseThrow(() -> new RuntimeException("ClassSubject mapping not found"));
    }

    public void removeSubjectFromClass(String classId, String subjectId) {
        classSubjectRepository.deleteByClassIdAndSubjectId(classId, subjectId);
    }

    public void unassignById(String id) {
        classSubjectRepository.deleteById(id);
    }

    private ClassSubjectDto mapToDto(ClassSubject cs) {
        ClassSubjectDto dto = new ClassSubjectDto();
        dto.setId(cs.getId());
        dto.setClassId(cs.getClassId());
        dto.setSubjectId(cs.getSubjectId());
        dto.setTeacherId(cs.getTeacherId());
        dto.setPeriodsPerWeek(cs.getPeriodsPerWeek());

        subjectRepository.findById(cs.getSubjectId()).ifPresent(subject -> {
            dto.setSubjectName(subject.getName());
            dto.setSubjectCode(subject.getCode());
            dto.setSubjectType(subject.getSubjectType());
        });

        if (cs.getTeacherId() != null) {
            staffRepository.findById(cs.getTeacherId()).ifPresent(staff -> {
                dto.setTeacherName(staff.getName());
            });
        }

        return dto;
    }
}
