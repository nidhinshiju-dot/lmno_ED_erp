package com.schoolerp.core.service;

import com.schoolerp.core.entity.Student;
import com.schoolerp.core.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private com.schoolerp.core.repository.ParentRepository parentRepository;

    @Autowired
    private CredentialsService credentialsService;

    public List<Student> getAllStudents() {
        return studentRepository.findByIsActiveTrue();
    }

    public Optional<Student> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        // Find or Create Parent Mapping via Contact Number
        if (student.getParentContact() != null && !student.getParentContact().trim().isEmpty()) {
            java.util.Optional<com.schoolerp.core.entity.Parent> existingParent = parentRepository.findByPhoneNumber(student.getParentContact().trim());
            
            if (existingParent.isPresent()) {
                student.setParentId(existingParent.get().getId().toString());
            } else {
                com.schoolerp.core.entity.Parent newParent = new com.schoolerp.core.entity.Parent();
                newParent.setName(student.getGuardianName() != null ? student.getGuardianName() : "Parent of " + student.getName());
                newParent.setPhoneNumber(student.getParentContact().trim());
                newParent.setRelation(student.getGuardianRelation() != null ? student.getGuardianRelation() : "Guardian");
                
                // Save and immediately map credential
                newParent = parentRepository.save(newParent);
                credentialsService.createParentCredential(newParent);
                
                student.setParentId(newParent.getId().toString());
            }
        } else if (student.getParentId() == null || student.getParentId().trim().isEmpty()) {
            student.setParentId("p-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        }
        
        // Save the Student, followed instantaneously by minting the auth credential
        Student savedStudent = studentRepository.save(student);
        credentialsService.createStudentCredential(savedStudent);
        return savedStudent;
    }

    public List<Student> getByParentId(String parentId) {
        return studentRepository.findByParentIdAndIsActiveTrue(parentId);
    }

    public List<Student> getByStatus(String status) {
        return studentRepository.findByStatusAndIsActiveTrue(status);
    }

    public List<Student> getByClassId(String classId) {
        return studentRepository.findByClassIdAndIsActiveTrue(classId);
    }

    public Student updateStudent(String id, Student updated) {
        return studentRepository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setDob(updated.getDob());
            s.setAddress(updated.getAddress());
            s.setParentContact(updated.getParentContact());
            s.setCountryCode(updated.getCountryCode());
            s.setGuardianName(updated.getGuardianName());
            s.setGuardianRelation(updated.getGuardianRelation());
            s.setParentId(updated.getParentId());
            s.setClassId(updated.getClassId());
            s.setPhotoUrl(updated.getPhotoUrl());
            return studentRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student updateStatus(String id, String status) {
        return studentRepository.findById(id).map(s -> {
            s.setStatus(status);
            return studentRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student transferStudent(String id, String newClassId) {
        return studentRepository.findById(id).map(s -> {
            s.setClassId(newClassId);
            return studentRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Student> promoteStudents(String fromClassId, String toClassId) {
        List<Student> students = studentRepository.findByClassIdAndIsActiveTrue(fromClassId);
        students.forEach(s -> {
            s.setClassId(toClassId);
        });
        return studentRepository.saveAll(students);
    }

    public Optional<Student> getFirstStudentByParentContact(String parentContact) {
        return studentRepository.findFirstByParentContactAndIsActiveTrue(parentContact);
    }

    public void deleteStudent(String id) {
        studentRepository.findById(id).ifPresent(s -> {
            s.setActive(false);
            studentRepository.save(s);
        });
    }
}
