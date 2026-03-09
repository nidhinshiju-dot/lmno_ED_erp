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

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getByParentId(String parentId) {
        return studentRepository.findByParentId(parentId);
    }

    public List<Student> getByStatus(String status) {
        return studentRepository.findByStatus(status);
    }

    public List<Student> getByClassId(String classId) {
        return studentRepository.findByClassId(classId);
    }

    public Student updateStudent(String id, Student updated) {
        return studentRepository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setDob(updated.getDob());
            s.setAddress(updated.getAddress());
            s.setParentContact(updated.getParentContact());
            s.setParentId(updated.getParentId());
            s.setClassId(updated.getClassId());
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
        List<Student> students = studentRepository.findByClassId(fromClassId);
        students.forEach(s -> {
            s.setClassId(toClassId);
        });
        return studentRepository.saveAll(students);
    }
}
