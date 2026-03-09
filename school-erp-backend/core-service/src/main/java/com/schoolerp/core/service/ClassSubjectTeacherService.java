package com.schoolerp.core.service;

import com.schoolerp.core.dto.ClassSubjectTeacherDto;
import com.schoolerp.core.entity.ClassSubjectTeacher;
import com.schoolerp.core.repository.ClassSubjectTeacherRepository;
import com.schoolerp.core.repository.SchoolClassRepository;
import com.schoolerp.core.repository.StaffRepository;
import com.schoolerp.core.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassSubjectTeacherService {

    private final ClassSubjectTeacherRepository repository;
    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;
    private final SchoolClassRepository schoolClassRepository;

    public List<ClassSubjectTeacherDto> getByClassId(String classId) {
        return repository.findByClassId(classId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<ClassSubjectTeacherDto> getByTeacherId(String teacherId) {
        return repository.findByTeacherId(teacherId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public ClassSubjectTeacherDto create(ClassSubjectTeacher cst) {
        return toDto(repository.save(cst));
    }

    public ClassSubjectTeacherDto update(String id, ClassSubjectTeacher updated) {
        return repository.findById(id).map(cst -> {
            cst.setTeacherId(updated.getTeacherId());
            cst.setPeriodsPerWeek(updated.getPeriodsPerWeek());
            cst.setPriority(updated.getPriority());
            return toDto(repository.save(cst));
        }).orElseThrow(() -> new RuntimeException("Assignment not found: " + id));
    }

    public void delete(String id) {
        repository.deleteById(id);
    }

    private ClassSubjectTeacherDto toDto(ClassSubjectTeacher cst) {
        ClassSubjectTeacherDto dto = new ClassSubjectTeacherDto();
        dto.setId(cst.getId());
        dto.setClassId(cst.getClassId());
        dto.setSubjectId(cst.getSubjectId());
        dto.setTeacherId(cst.getTeacherId());
        dto.setPeriodsPerWeek(cst.getPeriodsPerWeek());
        dto.setPriority(cst.getPriority());

        schoolClassRepository.findById(cst.getClassId())
                .ifPresent(c -> dto.setClassName(c.getName()));
        subjectRepository.findById(cst.getSubjectId()).ifPresent(s -> {
            dto.setSubjectName(s.getName());
            dto.setSubjectCode(s.getCode());
        });
        if (cst.getTeacherId() != null) {
            staffRepository.findById(cst.getTeacherId())
                    .ifPresent(t -> dto.setTeacherName(t.getName()));
        }
        return dto;
    }
}
