package com.schoolerp.core.service;

import com.schoolerp.core.entity.TeacherAvailability;
import com.schoolerp.core.repository.TeacherAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherAvailabilityService {

    private final TeacherAvailabilityRepository repository;

    public List<TeacherAvailability> getByTeacher(String teacherId) {
        return repository.findByTeacherId(teacherId);
    }

    public TeacherAvailability save(TeacherAvailability av) {
        // Upsert: if record exists for same teacher+day+block, update it
        return repository.findByTeacherIdAndDayIdAndBlockId(av.getTeacherId(), av.getDayId(), av.getBlockId())
                .map(existing -> {
                    existing.setIsAvailable(av.getIsAvailable());
                    return repository.save(existing);
                }).orElse(repository.save(av));
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
