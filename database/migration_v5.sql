-- ============================================================
-- Migration v5 — Add certificate_template_id to events table
-- Run: psql -U pramod_user -d pramod_rajput -f migration_v5.sql
-- ============================================================

-- Add certificate_template_id FK to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS certificate_template_id UUID
  REFERENCES certificate_templates(id) ON DELETE SET NULL;

-- Index for fast lookup of events by template
CREATE INDEX IF NOT EXISTS idx_events_certificate_template_id
  ON events(certificate_template_id);

-- ============================================================
-- Done
-- ============================================================
