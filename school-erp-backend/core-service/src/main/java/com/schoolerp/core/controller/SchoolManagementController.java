package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Campus;
import com.schoolerp.core.entity.AcademicEvent;
import com.schoolerp.core.repository.CampusRepository;
import com.schoolerp.core.repository.AcademicEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/school-management")
@RequiredArgsConstructor
public class SchoolManagementController {

    private final CampusRepository campusRepository;
    private final AcademicEventRepository academicEventRepository;

    // Campus endpoints
    @GetMapping("/campuses")
    public List<Campus> getCampuses() {
        return campusRepository.findByActiveTrue();
    }

    @PostMapping("/campuses")
    public ResponseEntity<Campus> createCampus(@Valid @RequestBody Campus campus) {
        return ResponseEntity.ok(campusRepository.save(campus));
    }

    // Academic Calendar endpoints
    @GetMapping("/calendar")
    public List<AcademicEvent> getCalendar() {
        return academicEventRepository.findByActiveTrueOrderByEventDateAsc();
    }

    @GetMapping("/calendar/range")
    public List<AcademicEvent> getCalendarRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return academicEventRepository.findByEventDateBetweenAndActiveTrue(from, to);
    }

    @PostMapping("/calendar")
    public ResponseEntity<AcademicEvent> createEvent(@Valid @RequestBody AcademicEvent event) {
        return ResponseEntity.ok(academicEventRepository.save(event));
    }

    @DeleteMapping("/calendar/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        academicEventRepository.findById(id).ifPresent(e -> {
            e.setActive(false);
            academicEventRepository.save(e);
        });
        return ResponseEntity.noContent().build();
    }
}
