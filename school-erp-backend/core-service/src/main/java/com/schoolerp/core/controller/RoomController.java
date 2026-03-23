package com.schoolerp.core.controller;

import com.schoolerp.core.entity.Room;
import com.schoolerp.core.entity.RoomType;
import com.schoolerp.core.entity.SubjectRoomRequirement;
import com.schoolerp.core.dto.LabGroupDto;
import com.schoolerp.core.dto.SubjectLabGroupRequirementDto;
import com.schoolerp.core.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService service;

    // ── Room Types ───────────────────────────────────────────────────────────

    @GetMapping("/types")
    public List<RoomType> getRoomTypes() {
        return service.getAllRoomTypes();
    }

    @PostMapping("/types")
    public RoomType createRoomType(@Valid @RequestBody RoomType rt) {
        return service.saveRoomType(rt);
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable String id) {
        service.deleteRoomType(id);
        return ResponseEntity.noContent().build();
    }

    // ── Rooms ─────────────────────────────────────────────────────────────────

    @GetMapping
    public List<Room> getRooms() {
        return service.getAllRooms();
    }

    @GetMapping("/by-type/{roomTypeId}")
    public List<Room> getByType(@PathVariable String roomTypeId) {
        return service.getRoomsByType(roomTypeId);
    }

    @PostMapping
    public Room createRoom(@Valid @RequestBody Room room) {
        return service.saveRoom(room);
    }

    @PutMapping("/{id}")
    public Room updateRoom(@PathVariable String id, @Valid @RequestBody Room room) {
        return service.updateRoom(id, room);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        service.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // ── Subject Room Requirements ─────────────────────────────────────────────

    @GetMapping("/requirements")
    public List<SubjectRoomRequirement> getRequirements() {
        return service.getRequirements();
    }

    @PostMapping("/requirements")
    public SubjectRoomRequirement createRequirement(@Valid @RequestBody SubjectRoomRequirement req) {
        return service.saveRequirement(req);
    }

    @DeleteMapping("/requirements/{id}")
    public ResponseEntity<Void> deleteRequirement(@PathVariable String id) {
        service.deleteRequirement(id);
        return ResponseEntity.noContent().build();
    }

    // ── Lab Groups ──────────────────────────────────────────────────────────

    @GetMapping("/lab-groups")
    public List<LabGroupDto> getLabGroups() {
        return service.getAllLabGroups();
    }

    @PostMapping("/lab-groups")
    public LabGroupDto createLabGroup(@Valid @RequestBody LabGroupDto lg) {
        return service.createLabGroup(lg);
    }

    @DeleteMapping("/lab-groups/{id}")
    public ResponseEntity<Void> deleteLabGroup(@PathVariable String id) {
        service.deleteLabGroup(id);
        return ResponseEntity.noContent().build();
    }

    // ── Subject Lab Group Requirements ───────────────────────────────────────

    @GetMapping("/lab-group-requirements")
    public List<SubjectLabGroupRequirementDto> getSubjectLabGroupRequirements() {
        return service.getAllSubjectLabGroupRequirements();
    }

    @PostMapping("/lab-group-requirements")
    public SubjectLabGroupRequirementDto createSubjectLabGroupRequirement(@Valid @RequestBody SubjectLabGroupRequirementDto req) {
        return service.saveSubjectLabGroupRequirement(req);
    }

    @DeleteMapping("/lab-group-requirements/{id}")
    public ResponseEntity<Void> deleteSubjectLabGroupRequirement(@PathVariable String id) {
        service.deleteSubjectLabGroupRequirement(id);
        return ResponseEntity.noContent().build();
    }
}
