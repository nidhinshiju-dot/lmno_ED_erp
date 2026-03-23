package com.schoolerp.lms.service;

import com.schoolerp.lms.entity.Exam;
import com.schoolerp.lms.entity.ExamTimetable;
import com.schoolerp.lms.entity.StudentMark;
import com.schoolerp.lms.repository.ExamRepository;
import com.schoolerp.lms.repository.ExamTimetableRepository;
import com.schoolerp.lms.repository.StudentMarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExamService {
    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamTimetableRepository timetableRepository;

    @Autowired
    private StudentMarkRepository studentMarkRepository;

    // Exam Operations
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public List<Exam> getExamsByClass(String classId) {
        return examRepository.findByClassId(classId);
    }

    public List<Exam> getExamsByTeacher(String teacherId) {
        return examRepository.findByTeacherId(teacherId);
    }

    public Optional<Exam> getExamById(String id) {
        return examRepository.findById(id);
    }

    public void deleteExam(String id) {
        examRepository.deleteById(id);
    }

    // Timetable Operations
    public ExamTimetable scheduleExam(ExamTimetable timetable) {
        return timetableRepository.save(timetable);
    }

    public List<ExamTimetable> getTimetableByClass(String classId) {
        return timetableRepository.findByClassId(classId);
    }
    
    public void deleteTimetable(String timetableId) {
        timetableRepository.deleteById(timetableId);
    }

    // Marks Operations
    public StudentMark recordMark(StudentMark mark) {
        return studentMarkRepository.save(mark);
    }

    public List<StudentMark> getMarksByExam(String examId) {
        return studentMarkRepository.findByExamId(examId);
    }
}
