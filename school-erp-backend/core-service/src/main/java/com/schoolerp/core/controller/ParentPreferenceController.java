package com.schoolerp.core.controller;

import com.schoolerp.core.entity.ParentNotificationPreference;
import com.schoolerp.core.repository.ParentNotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * A4/A5 — Parent notification settings and communication preferences.
 * GET/PUT /api/v1/parents/{parentId}/preferences
 */
@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
public class ParentPreferenceController {

    private final ParentNotificationPreferenceRepository prefRepo;

    /** Get preferences for a parent (returns empty defaults if not yet set) */
    @GetMapping("/{parentId}/preferences")
    public ResponseEntity<ParentNotificationPreference> getPreferences(@PathVariable String parentId) {
        ParentNotificationPreference pref = prefRepo.findByParentId(parentId)
                .orElseGet(() -> {
                    ParentNotificationPreference def = new ParentNotificationPreference();
                    def.setParentId(parentId);
                    return def;
                });
        return ResponseEntity.ok(pref);
    }

    /** Save/update preferences for a parent */
    @PutMapping("/{parentId}/preferences")
    public ResponseEntity<ParentNotificationPreference> savePreferences(
            @PathVariable String parentId,
            @RequestBody ParentNotificationPreference body) {

        ParentNotificationPreference pref = prefRepo.findByParentId(parentId)
                .orElse(new ParentNotificationPreference());

        pref.setParentId(parentId);
        pref.setEmailEnabled(body.getEmailEnabled());
        pref.setSmsEnabled(body.getSmsEnabled());
        pref.setPushEnabled(body.getPushEnabled());
        pref.setNotifyAttendance(body.getNotifyAttendance());
        pref.setNotifyExamResults(body.getNotifyExamResults());
        pref.setNotifyAssignments(body.getNotifyAssignments());
        pref.setNotifyAnnouncements(body.getNotifyAnnouncements());
        pref.setNotifyFeeReminders(body.getNotifyFeeReminders());
        pref.setPreferredLanguage(body.getPreferredLanguage());
        pref.setPreferredContact(body.getPreferredContact());

        return ResponseEntity.ok(prefRepo.save(pref));
    }
}
