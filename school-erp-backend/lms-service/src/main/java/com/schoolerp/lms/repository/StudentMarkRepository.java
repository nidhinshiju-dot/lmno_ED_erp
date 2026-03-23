package com.schoolerp.lms.repository;

import com.schoolerp.lms.entity.StudentMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentMarkRepository extends JpaRepository<StudentMark, String> {
    List<StudentMark> findByExamId(String examId);
    List<StudentMark> findByStudentId(String studentId);
    Optional<StudentMark> findByStudentIdAndExamId(String studentId, String examId);
}
