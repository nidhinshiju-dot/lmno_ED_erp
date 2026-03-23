package com.schoolerp.lms.service;

import com.schoolerp.lms.entity.Syllabus;
import com.schoolerp.lms.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SyllabusService {

    private final SyllabusRepository repository;

    public Syllabus create(Syllabus syllabus) {
        return repository.save(syllabus);
    }

    public List<Syllabus> getByTeacher(String teacherId) {
        return repository.findByTeacherId(teacherId);
    }

    public List<Syllabus> getByAssignment(String classSubjectTeacherId) {
        return repository.findByClassSubjectTeacherId(classSubjectTeacherId);
    }

    public List<Syllabus> getByGradeLevel(Integer gradeLevel) {
        return repository.findByGradeLevel(gradeLevel);
    }

    public List<Syllabus> getPendingVerifications() {
        return repository.findByStatus("PENDING");
    }

    public Syllabus updateStatus(String id, String status) {
        Optional<Syllabus> optional = repository.findById(id);
        if (optional.isPresent()) {
            Syllabus syllabus = optional.get();
            syllabus.setStatus(status);
            return repository.save(syllabus);
        }
        throw new RuntimeException("Syllabus not found");
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
