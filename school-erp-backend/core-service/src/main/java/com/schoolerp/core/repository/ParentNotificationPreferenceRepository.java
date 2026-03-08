package com.schoolerp.core.repository;

import com.schoolerp.core.entity.ParentNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ParentNotificationPreferenceRepository extends JpaRepository<ParentNotificationPreference, String> {
    Optional<ParentNotificationPreference> findByParentId(String parentId);
}
