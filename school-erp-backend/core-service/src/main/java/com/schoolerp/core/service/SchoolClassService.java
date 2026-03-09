package com.schoolerp.core.service;

import com.schoolerp.core.entity.SchoolClass;
import com.schoolerp.core.repository.SchoolClassRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SchoolClassService {

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private com.schoolerp.core.repository.StudentRepository studentRepository;

    @Autowired
    private com.schoolerp.core.repository.ClassSubjectRepository classSubjectRepository;

    public List<SchoolClass> getAllClasses() {
        return schoolClassRepository.findAll();
    }

    public Optional<SchoolClass> getClassById(String id) {
        return schoolClassRepository.findById(id);
    }

    public SchoolClass createClass(SchoolClass schoolClass) {
        return schoolClassRepository.save(schoolClass);
    }

    public SchoolClass assignTeacher(String id, String staffId) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        schoolClass.setClassTeacherId(staffId);
        return schoolClassRepository.save(schoolClass);
    }

    @Transactional
    public void deleteClass(String id) {
        List<com.schoolerp.core.entity.Student> activeStudents = studentRepository.findByClassId(id);
        if (!activeStudents.isEmpty()) {
            throw new org.springframework.dao.DataIntegrityViolationException("Cannot delete class. " + activeStudents.size() + " students are currently enrolled.");
        }
        
        List<com.schoolerp.core.entity.ClassSubject> linkedSubjects = classSubjectRepository.findByClassId(id);
        if (!linkedSubjects.isEmpty()) {
            throw new org.springframework.dao.DataIntegrityViolationException("Cannot delete class. It currently has " + linkedSubjects.size() + " assigned subjects.");
        }

        schoolClassRepository.deleteById(id);
    }
}
