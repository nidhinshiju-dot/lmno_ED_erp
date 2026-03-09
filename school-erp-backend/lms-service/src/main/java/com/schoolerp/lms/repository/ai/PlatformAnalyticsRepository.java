package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.PlatformAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlatformAnalyticsRepository extends JpaRepository<PlatformAnalytics, String> {

    @Query(value = "SELECT * FROM platform_analytics ORDER BY recorded_at DESC LIMIT 50", nativeQuery = true)
    List<PlatformAnalytics> findRecentAnalytics();
}
