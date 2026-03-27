package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiPromptTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AiPromptTemplateVersionRepository extends JpaRepository<AiPromptTemplateVersion, String> {
    Optional<AiPromptTemplateVersion> findByTenantIdAndTemplateKeyAndIsActiveTrue(String tenantId, String templateKey);
}
