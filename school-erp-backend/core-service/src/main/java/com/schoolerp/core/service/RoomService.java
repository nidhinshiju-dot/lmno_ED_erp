package com.schoolerp.core.service;

import com.schoolerp.core.entity.Room;
import com.schoolerp.core.entity.RoomType;
import com.schoolerp.core.entity.SubjectRoomRequirement;
import com.schoolerp.core.repository.RoomRepository;
import com.schoolerp.core.repository.RoomTypeRepository;
import com.schoolerp.core.repository.SubjectRoomRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final SubjectRoomRequirementRepository requirementRepository;

    // ── Room Types ──────────────────────────────────────────────────────────

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public RoomType saveRoomType(RoomType rt) {
        if (roomTypeRepository.existsByTypeName(rt.getTypeName())) {
            throw new RuntimeException("Room type already exists: " + rt.getTypeName());
        }
        return roomTypeRepository.save(rt);
    }

    public void deleteRoomType(String id) {
        roomTypeRepository.deleteById(id);
    }

    // ── Rooms ───────────────────────────────────────────────────────────────

    public List<Room> getAllRooms() {
        return roomRepository.findByIsActiveTrueOrderByRoomNameAsc();
    }

    public List<Room> getRoomsByType(String roomTypeId) {
        return roomRepository.findByRoomTypeIdAndIsActiveTrue(roomTypeId);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }

    public Room updateRoom(String id, Room updated) {
        return roomRepository.findById(id).map(r -> {
            r.setRoomName(updated.getRoomName());
            r.setRoomTypeId(updated.getRoomTypeId());
            r.setCapacity(updated.getCapacity());
            r.setBuilding(updated.getBuilding());
            r.setFloor(updated.getFloor());
            r.setIsActive(updated.getIsActive());
            return roomRepository.save(r);
        }).orElseThrow(() -> new RuntimeException("Room not found: " + id));
    }

    public void deleteRoom(String id) {
        roomRepository.findById(id).ifPresent(r -> {
            r.setIsActive(false);
            roomRepository.save(r);
        });
    }

    // ── Subject Room Requirements ───────────────────────────────────────────

    public List<SubjectRoomRequirement> getRequirements() {
        return requirementRepository.findAll();
    }

    public SubjectRoomRequirement saveRequirement(SubjectRoomRequirement req) {
        return requirementRepository.save(req);
    }

    public void deleteRequirement(String id) {
        requirementRepository.deleteById(id);
    }

    public Optional<String> getRequiredRoomTypeForSubject(String subjectId) {
        return requirementRepository.findBySubjectIdAndIsRequiredTrue(subjectId)
                .map(SubjectRoomRequirement::getRoomTypeId);
    }
}
