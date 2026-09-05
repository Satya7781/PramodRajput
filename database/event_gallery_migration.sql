-- ============================================================
-- Event Gallery Migration
-- Run after setup.sql:  psql -U postgres -d pramod_rajput -f event_gallery_migration.sql
-- ============================================================

-- Table: gallery_events
-- Stores named events grouped by year (separate from the registration-based events system)
CREATE TABLE IF NOT EXISTS gallery_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INTEGER NOT NULL CHECK (year BETWEEN 2009 AND 2028),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_events_year ON gallery_events(year DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_events_slug ON gallery_events(slug);

-- Table: gallery_media
-- Photos and videos attached to a gallery_event
CREATE TABLE IF NOT EXISTS gallery_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES gallery_events(id) ON DELETE CASCADE,
  media_type  TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  url         TEXT NOT NULL,
  thumbnail   TEXT,
  caption     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_media_event_id ON gallery_media(event_id);

-- updated_at trigger for gallery_events
DROP TRIGGER IF EXISTS trg_updated_at ON gallery_events;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON gallery_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Grant to app user
GRANT ALL PRIVILEGES ON gallery_events TO pramod_user;
GRANT ALL PRIVILEGES ON gallery_media   TO pramod_user;
