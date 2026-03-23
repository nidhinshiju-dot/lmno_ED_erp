package com.schoolerp.core.service;

import com.schoolerp.core.entity.Exam;
import com.schoolerp.core.entity.ExamResult;
import com.schoolerp.core.repository.ExamRepository;
import com.schoolerp.core.repository.ExamResultRepository;
import com.schoolerp.core.repository.ClassSubjectTeacherRepository;
import com.schoolerp.core.entity.ClassSubjectTeacher;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository resultRepository;

    public List<Exam> getAll() {
        return examRepository.findAll();
    }

    public List<Exam> getByClassId(String classId) {
        return examRepository.findByClassId(classId);
    }

    private final ClassSubjectTeacherRepository cstRepository;

    public List<Exam> getByTeacherId(String teacherId) {
        List<ClassSubjectTeacher> assignments = cstRepository.findByTeacherId(teacherId);
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

    public Exam create(Exam exam) {
        if (exam.getStatus() == null) exam.setStatus("SCHEDULED");
        return examRepository.save(exam);
    }

    public List<ExamResult> getResults(String examId) {
        return resultRepository.findByExamId(examId);
    }

    public List<ExamResult> getStudentResults(String studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    public List<ExamResult> saveResults(List<ExamResult> results) {
        return resultRepository.saveAll(results);
    }
}
