package com.schoolerp.core.service;

import com.schoolerp.core.entity.TimetableEntry;
import com.schoolerp.core.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository repository;

    public List<TimetableEntry> getBySectionId(String sectionId) {
        return repository.findBySectionIdOrderByDayAscPeriodAsc(sectionId);
    }

    public List<TimetableEntry> getAll() {
        return repository.findAll();
    }

    public TimetableEntry create(TimetableEntry entry) {
        return repository.save(entry);
    }
}
