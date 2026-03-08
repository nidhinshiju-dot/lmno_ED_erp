package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SchoolSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // School Identity
    @Column(name = "school_name")
    private String schoolName;

    @Column(name = "school_address")
    private String schoolAddress;

    @Column(name = "school_phone")
    private String schoolPhone;

    @Column(name = "school_email")
    private String schoolEmail;

    @Column(name = "school_website")
    private String schoolWebsite;

    @Column(name = "logo_url")
    private String logoUrl;

    // Locale
    private String timezone;
    private String language;
    private String currency;
    private String dateFormat;

    // Grading
    @Column(name = "grading_scale")
    private String gradingScale; // JSON string: e.g. {"A":90,"B":75,"C":60,...}

    // Working Hours
    @Column(name = "school_start_time")
    private String schoolStartTime;

    @Column(name = "school_end_time")
    private String schoolEndTime;

    @Column(name = "working_days")
    private String workingDays; // e.g. "MON,TUE,WED,THU,FRI"

    // Appearance
    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "tenant_id", unique = true)
    private String tenantId; // One settings record per school
}
