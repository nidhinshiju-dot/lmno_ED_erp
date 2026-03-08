package com.schoolerp.core.service;

import com.schoolerp.core.entity.Announcement;
import com.schoolerp.core.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public List<Announcement> getAll() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public List<Announcement> getByScope(String scope) {
        return announcementRepository.findByScopeAndActiveTrueOrderByCreatedAtDesc(scope);
    }

    public Announcement create(Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    public void deactivate(String id) {
        announcementRepository.findById(id).ifPresent(a -> {
            a.setActive(false);
            announcementRepository.save(a);
        });
    }
}
