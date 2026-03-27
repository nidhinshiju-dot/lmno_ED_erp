package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, String> {
    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();
    List<Announcement> findByScopeAndActiveTrueOrderByCreatedAtDesc(String scope);
    List<Announcement> findByTargetIdAndActiveTrueOrderByCreatedAtDesc(String targetId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Announcement a WHERE a.active = true AND (a.scope = 'SCHOOL' OR (a.scope = 'CLASS' AND a.targetId = :classId)) ORDER BY a.createdAt DESC")
    List<Announcement> findForStudent(@org.springframework.data.repository.query.Param("classId") String classId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Announcement a WHERE a.active = true AND (a.scope = 'SCHOOL' OR a.scope = 'TEACHER' OR a.createdBy = :staffId) ORDER BY a.createdAt DESC")
    List<Announcement> findForTeacher(@org.springframework.data.repository.query.Param("staffId") String staffId);
}
