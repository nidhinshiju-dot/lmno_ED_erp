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
        schoolClassRepository.deleteById(id);
    }
}
