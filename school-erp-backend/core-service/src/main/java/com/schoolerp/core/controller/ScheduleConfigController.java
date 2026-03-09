package com.schoolerp.core.controller;

import com.schoolerp.core.entity.WorkingDay;
import com.schoolerp.core.entity.PeriodBlock;
import com.schoolerp.core.service.ScheduleConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/schedule")
@RequiredArgsConstructor
public class ScheduleConfigController {

    private final ScheduleConfigService service;

    // ── Working Days ─────────────────────────────────────────────────────────

    @GetMapping("/working-days")
    public List<WorkingDay> getWorkingDays() {
        return service.getAllWorkingDays();
    }

    @PostMapping("/working-days")
    public WorkingDay createWorkingDay(@Valid @RequestBody WorkingDay day) {
        return service.saveWorkingDay(day);
    }

    @PatchMapping("/working-days/{id}/toggle")
    public WorkingDay toggleDay(@PathVariable String id,
            @Valid @RequestBody Map<String, Boolean> body) {
        return service.toggleDay(id, Boolean.TRUE.equals(body.get("isActive")));
    }

    @DeleteMapping("/working-days/{id}")
    public ResponseEntity<Void> deleteWorkingDay(@PathVariable String id) {
        service.deleteWorkingDay(id);
        return ResponseEntity.noContent().build();
    }

    // ── Period Blocks ─────────────────────────────────────────────────────────

    @GetMapping("/period-blocks")
    public List<PeriodBlock> getPeriodBlocks() {
        return service.getAllPeriodBlocks();
    }

    @PostMapping("/period-blocks")
    public PeriodBlock createPeriodBlock(@Valid @RequestBody PeriodBlock block) {
        return service.savePeriodBlock(block);
    }

    @PutMapping("/period-blocks/{id}")
    public PeriodBlock updatePeriodBlock(@PathVariable String id,
            @Valid @RequestBody PeriodBlock block) {
        return service.updatePeriodBlock(id, block);
    }

    @DeleteMapping("/period-blocks/{id}")
    public ResponseEntity<Void> deletePeriodBlock(@PathVariable String id) {
        service.deletePeriodBlock(id);
        return ResponseEntity.noContent().build();
    }
}
