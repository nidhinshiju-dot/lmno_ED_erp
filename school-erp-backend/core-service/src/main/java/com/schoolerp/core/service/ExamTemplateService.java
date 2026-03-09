package com.schoolerp.core.service;

import com.schoolerp.core.entity.Exam;
import com.schoolerp.core.entity.ExamSchedule;
import com.schoolerp.core.entity.ExamTemplate;
import com.schoolerp.core.entity.ExamTemplateSubject;
import com.schoolerp.core.repository.ExamRepository;
import com.schoolerp.core.repository.ExamScheduleRepository;
import com.schoolerp.core.repository.ExamTemplateRepository;
import com.schoolerp.core.repository.ExamTemplateSubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ExamTemplateService {

    @Autowired
    private ExamTemplateRepository templateRepository;

    @Autowired
    private ExamTemplateSubjectRepository templateSubjectRepository;
    
    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    public List<ExamTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public ExamTemplate createTemplate(ExamTemplate template) {
        return templateRepository.save(template);
    }
    
    public List<ExamTemplateSubject> getSubjectsForTemplate(String templateId) {
        return templateSubjectRepository.findByTemplateId(templateId);
    }
    
    public ExamTemplateSubject addSubjectToTemplate(ExamTemplateSubject subject) {
        return templateSubjectRepository.save(subject);
    }

    @Transactional
    public Exam generateExamFromTemplate(String templateId, String classId, String examName, LocalDate startDate) {
        templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        List<ExamTemplateSubject> templateSubjects = templateSubjectRepository.findByTemplateId(templateId);
        
        int totalMarks = templateSubjects.stream().mapToInt(ExamTemplateSubject::getTotalMarks).sum();

        // Create the top-level Exam record
        Exam exam = new Exam();
        exam.setName(examName);
        exam.setClassId(classId);
        exam.setExamDate(startDate);
        exam.setTotalMarks(totalMarks);
        exam.setStatus("SCHEDULED");
        exam = examRepository.save(exam);

        // Create individual schedules based on day offsets
        for (ExamTemplateSubject ts : templateSubjects) {
            ExamSchedule schedule = new ExamSchedule();
            schedule.setExamId(exam.getId());
            schedule.setSubjectId(ts.getSubjectCode()); // Assuming subjectCode is the actual subject identifier
            schedule.setExamDate(startDate.plusDays(ts.getDayOffset()));
            // Default time for now, could be dynamic in the future
            schedule.setStartTime(LocalTime.of(9, 0));
            schedule.setEndTime(LocalTime.of(12, 0));
            examScheduleRepository.save(schedule);
        }

        return exam;
    }
}
