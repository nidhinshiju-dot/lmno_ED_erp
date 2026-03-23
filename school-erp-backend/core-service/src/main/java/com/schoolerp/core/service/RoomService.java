package com.schoolerp.core.service;

import com.schoolerp.core.entity.Room;
import com.schoolerp.core.entity.RoomType;
import com.schoolerp.core.entity.SubjectRoomRequirement;
import com.schoolerp.core.entity.LabGroup;
import com.schoolerp.core.entity.LabGroupRoom;
import com.schoolerp.core.entity.SubjectLabGroupRequirement;
import com.schoolerp.core.repository.RoomRepository;
import com.schoolerp.core.repository.RoomTypeRepository;
import com.schoolerp.core.repository.SubjectRoomRequirementRepository;
import com.schoolerp.core.repository.LabGroupRepository;
import com.schoolerp.core.repository.LabGroupRoomRepository;
import com.schoolerp.core.repository.SubjectLabGroupRequirementRepository;
import com.schoolerp.core.dto.LabGroupDto;
import com.schoolerp.core.dto.SubjectLabGroupRequirementDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final SubjectRoomRequirementRepository requirementRepository;
    private final LabGroupRepository labGroupRepository;
    private final LabGroupRoomRepository labGroupRoomRepository;
    private final SubjectLabGroupRequirementRepository subjectLabGroupRequirementRepository;

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

    // ── Lab Groups ──────────────────────────────────────────────────────────

    public List<LabGroupDto> getAllLabGroups() {
        return labGroupRepository.findAll().stream().map(lg -> {
            LabGroupDto dto = new LabGroupDto();
            dto.setId(lg.getId());
            dto.setName(lg.getName());
            List<String> roomIds = labGroupRoomRepository.findByLabGroupId(lg.getId())
                    .stream()
                    .map(LabGroupRoom::getRoomId)
                    .collect(Collectors.toList());
            dto.setRoomIds(roomIds);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public LabGroupDto createLabGroup(LabGroupDto dto) {
        LabGroup lg = new LabGroup();
        lg.setName(dto.getName());
        lg = labGroupRepository.save(lg);

        if (dto.getRoomIds() != null) {
            for (String roomId : dto.getRoomIds()) {
                LabGroupRoom lgr = new LabGroupRoom();
                lgr.setLabGroupId(lg.getId());
                lgr.setRoomId(roomId);
                labGroupRoomRepository.save(lgr);
            }
        }

        dto.setId(lg.getId());
        return dto;
    }

    @Transactional
    public void deleteLabGroup(String id) {
        labGroupRoomRepository.deleteByLabGroupId(id);
        labGroupRepository.deleteById(id);
    }

    // ── Subject Lab Group Requirements ───────────────────────────────────────

    public List<SubjectLabGroupRequirementDto> getAllSubjectLabGroupRequirements() {
        return subjectLabGroupRequirementRepository.findAll().stream().map(r -> {
            SubjectLabGroupRequirementDto dto = new SubjectLabGroupRequirementDto();
            dto.setId(r.getId());
            dto.setSubjectId(r.getSubjectId());
            dto.setLabGroupId(r.getLabGroupId());
            return dto;
        }).collect(Collectors.toList());
    }

    public SubjectLabGroupRequirementDto saveSubjectLabGroupRequirement(SubjectLabGroupRequirementDto dto) {
        SubjectLabGroupRequirement req = new SubjectLabGroupRequirement();
        req.setSubjectId(dto.getSubjectId());
        req.setLabGroupId(dto.getLabGroupId());
        req = subjectLabGroupRequirementRepository.save(req);
        dto.setId(req.getId());
        return dto;
    }

    public void deleteSubjectLabGroupRequirement(String id) {
        subjectLabGroupRequirementRepository.deleteById(id);
    }
}
