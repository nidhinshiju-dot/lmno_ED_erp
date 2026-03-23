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
    private com.schoolerp.core.repository.TimetableRepository timetableRepository;

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

    public SchoolClass updateClass(String id, SchoolClass updated) {
        SchoolClass existing = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (updated.getCapacity() != null) {
            int currentEnrollment = studentRepository.findByClassIdAndIsActiveTrue(id).size();
            if (updated.getCapacity() < currentEnrollment) {
                throw new com.schoolerp.core.exception.DependencyConflictException("Cannot reduce Class capacity (" + updated.getCapacity() + ") below current active enrollment of " + currentEnrollment + " students.");
            }
            existing.setCapacity(updated.getCapacity());
        }

        existing.setName(updated.getName());
        existing.setAcademicYear(updated.getAcademicYear());
        existing.setGradeLevel(updated.getGradeLevel());
        existing.setBranch(updated.getBranch());
        existing.setRoomNumber(updated.getRoomNumber());
        
        return schoolClassRepository.save(existing);
    }

    @Transactional
    public void deleteClass(String id) {
        List<com.schoolerp.core.entity.Student> activeStudents = studentRepository.findByClassIdAndIsActiveTrue(id);
        if (!activeStudents.isEmpty()) {
            throw new com.schoolerp.core.exception.DependencyConflictException("Cannot delete class. " + activeStudents.size() + " students are currently enrolled.");
        }
        
        
        List<com.schoolerp.core.entity.ClassSubject> linkedSubjects = classSubjectRepository.findByClassId(id);
        classSubjectRepository.deleteAll(linkedSubjects);

        List<com.schoolerp.core.entity.TimetableEntry> timetables = timetableRepository.findByClassIdOrderByDayAscPeriodAsc(id);
        timetableRepository.deleteAll(timetables);

        schoolClassRepository.deleteById(id);
    }
}
