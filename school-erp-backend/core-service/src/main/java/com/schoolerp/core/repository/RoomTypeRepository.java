package com.schoolerp.core.repository;

import com.schoolerp.core.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, String> {
    boolean existsByTypeName(String typeName);
}
