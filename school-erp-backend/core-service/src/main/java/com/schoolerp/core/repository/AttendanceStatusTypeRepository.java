package com.schoolerp.core.repository;

import com.schoolerp.core.entity.AttendanceStatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceStatusTypeRepository extends JpaRepository<AttendanceStatusType, String> {
    Optional<AttendanceStatusType> findByCode(String code);
}
