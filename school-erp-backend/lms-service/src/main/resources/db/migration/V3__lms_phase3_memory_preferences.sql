CREATE TABLE IF NOT EXISTS ai_tutor_preferences (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    tutor_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    explanation_style VARCHAR(255) DEFAULT 'BALANCED',
    answer_length VARCHAR(255) DEFAULT 'MODERATE',
    prefer_examples BOOLEAN DEFAULT TRUE,
    prefer_formulas BOOLEAN DEFAULT TRUE,
    prefer_theory BOOLEAN DEFAULT TRUE,
    goal_type VARCHAR(255) DEFAULT 'GENERAL_MASTERY',
    updated_at TIMESTAMP
);

CREATE INDEX idx_ai_tutor_preferences_tutor_student ON ai_tutor_preferences (tenant_id, tutor_id, student_id);
ALTER TABLE ai_tutor_preferences ADD CONSTRAINT uq_tutor_preference UNIQUE (tenant_id, tutor_id, student_id);

CREATE TABLE IF NOT EXISTS ai_tutor_memories (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    tutor_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    memory_type VARCHAR(255) NOT NULL,
    memory_key VARCHAR(255) NOT NULL,
    memory_value_json TEXT NOT NULL,
    importance INTEGER DEFAULT 1,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_ai_tutor_memories_tutor_student ON ai_tutor_memories (tenant_id, tutor_id, student_id);
