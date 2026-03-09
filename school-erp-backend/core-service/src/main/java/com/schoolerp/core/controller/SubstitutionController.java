package com.schoolerp.core.controller;

import com.schoolerp.core.dto.SubstitutionDto;
import com.schoolerp.core.entity.Substitution;
import com.schoolerp.core.service.SubstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/substitutions")
@RequiredArgsConstructor
public class SubstitutionController {

    private final SubstitutionService service;

    @GetMapping("/date/{date}")
    public List<SubstitutionDto> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.getByDate(date);
    }

    @PostMapping
    public Substitution create(@RequestBody Substitution sub) {
        return service.create(sub);
    }

    @PostMapping("/{id}/confirm")
    public Substitution confirm(@PathVariable String id,
            @RequestBody Map<String, String> body) {
        return service.confirm(id, body.get("substituteTeacherId"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/suggest")
    public List<Map<String, String>> suggest(
            @RequestParam String timetableId,
            @RequestParam String originalTeacherId,
            @RequestParam String blockId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.suggestSubstitutes(timetableId, originalTeacherId, blockId, date);
    }
}
