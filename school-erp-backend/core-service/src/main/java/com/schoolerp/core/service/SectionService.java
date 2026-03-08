package com.schoolerp.core.service;

import com.schoolerp.core.entity.Section;
import com.schoolerp.core.entity.Staff;
import com.schoolerp.core.repository.SectionRepository;
import com.schoolerp.core.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private StaffRepository staffRepository;

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public List<Section> getSectionsByClassId(String classId) {
        return sectionRepository.findBySchoolClassId(classId);
    }

    public Optional<Section> getSectionById(String id) {
        return sectionRepository.findById(id);
    }

    public Section createSection(Section section) {
        return sectionRepository.save(section);
    }

    public Section assignClassTeacher(String sectionId, String staffId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        Staff teacher = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        section.setClassTeacher(teacher);
        return sectionRepository.save(section);
    }
}
