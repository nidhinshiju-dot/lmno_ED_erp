CREATE TABLE IF NOT EXISTS ai_tutor_insights (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    tutor_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255),
    insight_type VARCHAR(255) NOT NULL,
    topic_key VARCHAR(255),
    topic_label VARCHAR(255),
    score DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    source_snapshot_json TEXT,
    generated_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_ai_tutor_insights_tutor_student ON ai_tutor_insights (tenant_id, tutor_id, student_id);
