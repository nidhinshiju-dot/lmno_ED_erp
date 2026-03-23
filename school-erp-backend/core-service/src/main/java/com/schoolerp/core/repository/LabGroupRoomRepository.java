package com.schoolerp.core.repository;

import com.schoolerp.core.entity.LabGroupRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabGroupRoomRepository extends JpaRepository<LabGroupRoom, String> {
    List<LabGroupRoom> findByLabGroupId(String labGroupId);
    void deleteByLabGroupId(String labGroupId);
}
