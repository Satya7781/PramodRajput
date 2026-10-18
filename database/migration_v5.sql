-- ============================================================
-- Migration v5 — Add certificate_template_id to events table
--               + backfill missing columns from migration_v4
-- Run: psql -U pramod_user -d pramod_rajput -f migration_v5.sql
-- ============================================================

-- Add certificate_template_id FK to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS certificate_template_id UUID
  REFERENCES certificate_templates(id) ON DELETE SET NULL;

-- Index for fast lookup of events by template
CREATE INDEX IF NOT EXISTS idx_events_certificate_template_id
  ON events(certificate_template_id);

-- Backfill: name_field_key on event_forms (was in migration_v4 but may not have run)
ALTER TABLE event_forms
  ADD COLUMN IF NOT EXISTS name_field_key TEXT;

-- Backfill: sequences (safe if already exist)
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS certificate_number_seq  START 1 INCREMENT 1;

-- Backfill: registration_values optional columns
ALTER TABLE registration_values ADD COLUMN IF NOT EXISTS value_json JSONB;
ALTER TABLE registration_values ADD COLUMN IF NOT EXISTS file_url   TEXT;

-- Backfill: soft-delete default for form_fields
ALTER TABLE form_fields ALTER COLUMN is_active SET DEFAULT TRUE;

-- Backfill: certificate lookup indexes
CREATE INDEX IF NOT EXISTS idx_certificates_verification_token
  ON certificates(verification_token);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number
  ON certificates(certificate_number);

-- ============================================================
-- Done
-- ============================================================
