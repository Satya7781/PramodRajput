-- ============================================================
-- Migration v4 — Fix all issues from audit
-- Run: psql -U pramod_user -d pramod_rajput -f migration_v4.sql
-- ============================================================

-- ISSUE-06 fix: atomic sequence for registration numbers (no race condition)
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START 1 INCREMENT 1;

-- ISSUE-07 fix: atomic sequence for certificate numbers (no race condition)
CREATE SEQUENCE IF NOT EXISTS certificate_number_seq START 1 INCREMENT 1;

-- Seed the sequences with the current max values so existing numbers stay valid
DO $$
DECLARE
  reg_max bigint;
  cert_max bigint;
BEGIN
  SELECT COALESCE(MAX(
    CAST(REGEXP_REPLACE(registration_number, '^PR-\d{4}-', '') AS bigint)
  ), 0) INTO reg_max FROM registrations WHERE registration_number ~ '^PR-\d{4}-\d+$';

  SELECT COALESCE(MAX(
    CAST(REGEXP_REPLACE(certificate_number, '^PR-CERT-\d{4}-', '') AS bigint)
  ), 0) INTO cert_max FROM certificates WHERE certificate_number ~ '^PR-CERT-\d{4}-\d+$';

  IF reg_max > 0 THEN
    PERFORM setval('registration_number_seq', reg_max);
  END IF;

  IF cert_max > 0 THEN
    PERFORM setval('certificate_number_seq', cert_max);
  END IF;
END $$;

-- ISSUE-04 fix: add name_field_key to event_forms so the correct field is used for certificates
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS name_field_key TEXT;

-- ISSUE-15 fix: add value_json column if not present (some deployments may be missing it)
ALTER TABLE registration_values ADD COLUMN IF NOT EXISTS value_json JSONB;

-- ISSUE-15 fix: add file_url column if not present
ALTER TABLE registration_values ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Fix: ensure form_fields.is_active has a default (for soft-delete behaviour)
ALTER TABLE form_fields ALTER COLUMN is_active SET DEFAULT TRUE;

-- Create public/certificates directory placeholder (handled by app at runtime)
-- No SQL needed — the directory is created by the PDF generator on first use.

-- Add index on verification_token for fast lookup (ISSUE-11 / ISSUE-12)
CREATE INDEX IF NOT EXISTS idx_certificates_verification_token ON certificates(verification_token);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);

-- ============================================================
-- Done
-- ============================================================
