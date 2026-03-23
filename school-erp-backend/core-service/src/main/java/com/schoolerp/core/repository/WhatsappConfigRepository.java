package com.schoolerp.core.repository;

import com.schoolerp.core.entity.WhatsappConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WhatsappConfigRepository extends JpaRepository<WhatsappConfig, UUID> {
    Optional<WhatsappConfig> findBySchoolId(UUID schoolId);
}
