package com.schoolerp.lms.entity.ai;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Table(name = "platform_analytics")
@Getter
public class PlatformAnalytics {

    @Id
    private String id;

    @Column(name = "metric_name")
    private String metricName;

    @Column(name = "metric_value")
    private String metricValue;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
