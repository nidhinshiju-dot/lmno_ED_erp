package com.schoolerp.core.service;

import com.schoolerp.core.entity.Subject;
import com.schoolerp.core.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> getAll() {
        return subjectRepository.findAll();
    }

    public Optional<Subject> getById(String id) {
        return subjectRepository.findById(id);
    }

    public List<Subject> getByClassId(String classId) {
        return subjectRepository.findByClassId(classId);
    }

    public List<Subject> getByTeacherId(String teacherId) {
        return subjectRepository.findByTeacherId(teacherId);
    }

    public Subject create(Subject subject) {
        if (subject.getStatus() == null) {
            subject.setStatus("ACTIVE");
        }
        return subjectRepository.save(subject);
    }

    public Subject update(String id, Subject updated) {
        return subjectRepository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setCode(updated.getCode());
            s.setDescription(updated.getDescription());
            s.setClassId(updated.getClassId());
            s.setTeacherId(updated.getTeacherId());
            s.setStatus(updated.getStatus());
            return subjectRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Subject not found"));
    }
}
