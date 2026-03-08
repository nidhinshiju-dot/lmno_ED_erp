package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
    List<Subject> findByClassId(String classId);
    List<Subject> findByTeacherId(String teacherId);
}
