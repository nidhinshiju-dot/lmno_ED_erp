package com.schoolerp.lms.service;

import com.schoolerp.lms.entity.QuestionPaper;
import com.schoolerp.lms.repository.QuestionPaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionPaperService {
    @Autowired
    private QuestionPaperRepository questionPaperRepository;

    public QuestionPaper savePaper(QuestionPaper paper) {
        return questionPaperRepository.save(paper);
    }

    public List<QuestionPaper> getAllPapers() {
        return questionPaperRepository.findAll();
    }

    public Optional<QuestionPaper> getPaperById(String id) {
        return questionPaperRepository.findById(id);
    }

    public List<QuestionPaper> getPapersByExam(String examId) {
        return questionPaperRepository.findByExamId(examId);
    }

    public List<QuestionPaper> getPapersByTeacher(String teacherId) {
        return questionPaperRepository.findByTeacherId(teacherId);
    }

    public List<QuestionPaper> getPendingPapers() {
        return questionPaperRepository.findByStatus("SUBMITTED");
    }

    public QuestionPaper updateStatus(String id, String status, Integer templateId) {
        return questionPaperRepository.findById(id).map(paper -> {
            paper.setStatus(status);
            if (templateId != null) {
                paper.setPrintTemplateId(templateId);
            }
            return questionPaperRepository.save(paper);
        }).orElseThrow(() -> new RuntimeException("Question paper not found"));
    }

    public void deletePaper(String id) {
        questionPaperRepository.deleteById(id);
    }
}
