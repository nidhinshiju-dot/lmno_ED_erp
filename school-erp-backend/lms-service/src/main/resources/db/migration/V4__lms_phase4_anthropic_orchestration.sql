CREATE TABLE ai_usage_logs (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    tutor_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    model_used VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_prompt_template_versions (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    template_key VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    version INT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_template_version UNIQUE (tenant_id, template_key, version)
);
