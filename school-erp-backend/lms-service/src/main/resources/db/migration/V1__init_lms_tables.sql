CREATE TABLE IF NOT EXISTS syllabi (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    storage_key VARCHAR(255),
    file_name VARCHAR(255),
    mime_type VARCHAR(255),
    file_size BIGINT,
    version INTEGER DEFAULT 1,
    uploaded_by_user_id VARCHAR(255),
    uploaded_by_staff_id VARCHAR(255),
    status VARCHAR(255) DEFAULT 'VERIFIED',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_tutors (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'ACTIVE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    tutor_id VARCHAR(255) NOT NULL,
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_tutor_messages (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    sender_role VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS study_plans (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    tutor_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
