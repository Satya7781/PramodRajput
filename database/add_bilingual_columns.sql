-- ============================================================
-- Add bilingual (_en) columns to events, news, event_memories
-- Run on your VPS PostgreSQL after setup.sql:
--   psql -U pramod_user -d pramod_rajput -f database/add_bilingual_columns.sql
-- ============================================================

-- EVENTS — English versions of text fields
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS title_en             TEXT,
  ADD COLUMN IF NOT EXISTS short_description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en       TEXT;

-- NEWS — English versions of text fields
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS title_en   TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT;

-- EVENT MEMORIES — English versions of text fields
ALTER TABLE event_memories
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

-- ============================================================
-- Done. Verify with:
--   \d events
--   \d news
--   \d event_memories
-- ============================================================
