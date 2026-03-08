package com.schoolerp.core.repository;

import com.schoolerp.core.entity.SchoolSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, String> {
    Optional<SchoolSettings> findByTenantId(String tenantId);
}
