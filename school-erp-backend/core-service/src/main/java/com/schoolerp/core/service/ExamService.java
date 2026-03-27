package com.schoolerp.core.service;

import com.schoolerp.core.entity.Exam;
import com.schoolerp.core.entity.ExamResult;
import com.schoolerp.core.entity.ClassSubjectTeacher;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.entity.Parent;
import com.schoolerp.core.repository.ExamRepository;
import com.schoolerp.core.repository.ExamResultRepository;
import com.schoolerp.core.repository.ClassSubjectTeacherRepository;
import com.schoolerp.core.repository.StudentRepository;
import com.schoolerp.core.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository resultRepository;
    private final ClassSubjectTeacherRepository cstRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;

    public List<Exam> getAll() {
        return examRepository.findAll();
    }

    public List<Exam> getByClassId(String classId) {
        return examRepository.findByClassId(classId);
    }

    public List<Exam> getMyTeacherExams(String staffId) {
        if (staffId == null) throw new RuntimeException("Unauthorized: Missing Staff ID");
        List<ClassSubjectTeacher> assignments = cstRepository.findByTeacherId(staffId);
        List<Exam> allTeacherExams = new ArrayList<>();
        for (ClassSubjectTeacher cst : assignments) {
            List<Exam> classExams = examRepository.findByClassId(cst.getClassId());
            for (Exam e : classExams) {
                if (e.getSubjectId().equals(cst.getSubjectId())) {
                    allTeacherExams.add(e);
                }
            }
        }
        return allTeacherExams;
    }

    public Exam create(Exam exam, String role) {
        if (!"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            throw new RuntimeException("Forbidden: Only ADMIN can create exams");
        }
        if (exam.getStatus() == null) exam.setStatus("SCHEDULED");
        return examRepository.save(exam);
    }

    public List<ExamResult> getResults(String examId) {
        return resultRepository.findByExamId(examId);
    }

    public List<ExamResult> getMyStudentResults(String userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found for user"));
        return resultRepository.findByStudentId(student.getId());
    }

    public List<ExamResult> getMyParentChildrenResults(String userId) {
        Parent parent = parentRepository.findByUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Parent profile not found for user"));
        List<Student> children = studentRepository.findByParentIdAndIsActiveTrue(parent.getId().toString());
        List<String> childIds = children.stream().map(Student::getId).collect(Collectors.toList());
        List<ExamResult> allResults = new ArrayList<>();
        for (String childId : childIds) {
            allResults.addAll(resultRepository.findByStudentId(childId));
        }
        return allResults;
    }

    public List<ExamResult> saveResults(String examId, List<ExamResult> results, String role, String staffId) {
        if ("TEACHER".equals(role)) {
            if (staffId == null) throw new RuntimeException("Unauthorized: Missing Staff ID");
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            
            // Validate teacher assignment
            List<ClassSubjectTeacher> assignments = cstRepository.findByClassIdAndSubjectId(exam.getClassId(), exam.getSubjectId());
            boolean isAssigned = assignments.stream().anyMatch(a -> staffId.equals(a.getTeacherId()));
            if (!isAssigned) {
                throw new RuntimeException("Forbidden: You are not assigned to this class and subject");
            }
        } else if (!"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            throw new RuntimeException("Forbidden: Only TEACHER or ADMIN can upload marks");
        }

        for (ExamResult r : results) {
            r.setExamId(examId);
            // Optionally calculate normalizedScore locally here or keep as passed by frontend if trusted
        }
        return resultRepository.saveAll(results);
    }
}
