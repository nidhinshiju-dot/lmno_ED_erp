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
}
