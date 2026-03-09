package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ClassSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSubjectRepository extends JpaRepository<ClassSubject, String> {

    List<ClassSubject> findByClassId(String classId);

    List<ClassSubject> findBySubjectId(String subjectId);

    Optional<ClassSubject> findByClassIdAndSubjectId(String classId, String subjectId);

    List<ClassSubject> findByTeacherId(String teacherId);

    void deleteByClassIdAndSubjectId(String classId, String subjectId);

    void deleteBySubjectId(String subjectId);
}
