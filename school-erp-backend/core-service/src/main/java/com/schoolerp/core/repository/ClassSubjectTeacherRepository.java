package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ClassSubjectTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassSubjectTeacherRepository extends JpaRepository<ClassSubjectTeacher, String> {
    List<ClassSubjectTeacher> findByClassId(String classId);

    List<ClassSubjectTeacher> findByTeacherId(String teacherId);

    List<ClassSubjectTeacher> findBySubjectId(String subjectId);

    List<ClassSubjectTeacher> findByClassIdAndSubjectId(String classId, String subjectId);

    void deleteByClassIdAndSubjectId(String classId, String subjectId);
}
