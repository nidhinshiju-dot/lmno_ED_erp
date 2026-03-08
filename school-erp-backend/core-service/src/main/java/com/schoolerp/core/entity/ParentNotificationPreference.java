package com.schoolerp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * A4/A5 — Parent notification and communication preferences.
 * Stored per parent (userId) with toggles for each notification channel.
 */
@Entity
@Table(name = "parent_notification_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ParentNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "parent_id", nullable = false, unique = true)
    private String parentId; // Links to Staff/User ID

    // ── Notification Channel Toggles ──────────────────────────────────────
    @Column(name = "email_enabled")
    private Boolean emailEnabled = true;

    @Column(name = "sms_enabled")
    private Boolean smsEnabled = false;

    @Column(name = "push_enabled")
    private Boolean pushEnabled = true;

    // ── Per-Event Toggles ─────────────────────────────────────────────────
    @Column(name = "notify_attendance")
    private Boolean notifyAttendance = true;

    @Column(name = "notify_exam_results")
    private Boolean notifyExamResults = true;

    @Column(name = "notify_assignments")
    private Boolean notifyAssignments = true;

    @Column(name = "notify_announcements")
    private Boolean notifyAnnouncements = true;

    @Column(name = "notify_fee_reminders")
    private Boolean notifyFeeReminders = true;

    // ── Communication Preferences ─────────────────────────────────────────
    @Column(name = "preferred_language")
    private String preferredLanguage = "en";

    @Column(name = "preferred_contact")
    private String preferredContact; // EMAIL or PHONE

    @PrePersist
    void defaults() {
        if (emailEnabled == null)           emailEnabled = true;
        if (smsEnabled == null)             smsEnabled = false;
        if (pushEnabled == null)            pushEnabled = true;
        if (notifyAttendance == null)       notifyAttendance = true;
        if (notifyExamResults == null)      notifyExamResults = true;
        if (notifyAssignments == null)      notifyAssignments = true;
        if (notifyAnnouncements == null)    notifyAnnouncements = true;
        if (notifyFeeReminders == null)     notifyFeeReminders = true;
        if (preferredLanguage == null)      preferredLanguage = "en";
    }
}
