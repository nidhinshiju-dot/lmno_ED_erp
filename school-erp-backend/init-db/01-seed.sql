-- ════════════════════════════════════════════════════════════════════════════
-- School ERP — UAT Seed Data
-- Runs automatically when Postgres container starts (init-db mounted)
-- ════════════════════════════════════════════════════════════════════════════


-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Create Tenant Schema ──────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS sunrise;
SET search_path TO sunrise, public;

-- ════════════════════════════════════════════════════════════════════════════
-- USERS (Shared Authentication Table in Public Schema)
-- ════════════════════════════════════════════════════════════════════════════
SET search_path TO public;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,  -- BCrypt hashed
    role VARCHAR NOT NULL,
    tenant_id VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR
);

-- Passwords are BCrypt hash of literal shown in comment
-- Super Admin password: SuperAdmin@2026
INSERT INTO users (id, email, password, role, tenant_id, first_name, last_name) VALUES
-- Platform Super Admins (no tenant)
('usr-super-1', 'superadmin1@schoolerp.app',
 '$2a$12$RKNdGSHQrxh.pZjJY1SHiu7RAWxp2MbCMQxY9mvg5NWgxJJk.o63e', 'SUPER_ADMIN', NULL, 'Super', 'Admin 1'),
('usr-super-2', 'superadmin2@schoolerp.app',
 '$2a$12$RKNdGSHQrxh.pZjJY1SHiu7RAWxp2MbCMQxY9mvg5NWgxJJk.o63e', 'SUPER_ADMIN', NULL, 'Super', 'Admin 2'),
('usr-super-3', 'superadmin3@schoolerp.app',
 '$2a$12$RKNdGSHQrxh.pZjJY1SHiu7RAWxp2MbCMQxY9mvg5NWgxJJk.o63e', 'SUPER_ADMIN', NULL, 'Super', 'Admin 3');

-- ════════════════════════════════════════════════════════════════════════════
-- Done ✅
-- ════════════════════════════════════════════════════════════════════════════
SELECT 'Seed data inserted successfully!' AS status;
