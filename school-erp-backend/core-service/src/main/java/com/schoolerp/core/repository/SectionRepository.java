package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, String> {
    List<Section> findBySchoolClassId(String classId);
    List<Section> findByClassTeacherId(String classTeacherId);
}
