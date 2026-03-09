package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByIsActiveTrueOrderByRoomNameAsc();

    List<Room> findByRoomTypeIdAndIsActiveTrue(String roomTypeId);
}
