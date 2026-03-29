-- Database Migration Script for Secure Auth Tokens
-- Apply this script to the PostgreSQL 'school_erp' database

-- 1. Add fields for storing securely hashed transient tokens
ALTER TABLE users ADD COLUMN reset_token_hash VARCHAR(255);

-- 2. Add field for storing the millisecond timestamp integer for expiry
ALTER TABLE users ADD COLUMN reset_token_expiry BIGINT;

-- 3. Add field for explicit purpose tracking (e.g. 'INITIAL_PROVISIONING', 'PASSWORD_RESET')
ALTER TABLE users ADD COLUMN reset_token_purpose VARCHAR(50);

-- Note: Because these are transient fields used on-demand, NO backfilling of existing users is necessary.
-- Any previous Base64 email-encoded links floating around will gracefully fail during decryption,
-- enforcing users to generate a new valid secure link via the platform.
