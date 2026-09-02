-- ============================================================
-- Migration v2 — Run AFTER setup.sql
-- Adds: event_memories, memory_photos, memory_videos tables
--       bilingual (_en) columns on events, news, event_memories
--       updated_at triggers for new tables
--
-- Run on VPS:
--   psql -U pramod_user -d pramod_rajput -f database/migration_v2.sql
-- ============================================================

-- ============================================================
-- EVENT MEMORIES (past event highlights with photos & videos)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_memories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  event_date      DATE NOT NULL,
  location        TEXT,
  description     TEXT,
  cover_image_url TEXT,
  status          TEXT NOT NULL DEFAULT 'published'
                    CHECK (status IN ('draft','published','archived')),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memories_slug   ON event_memories(slug);
CREATE INDEX IF NOT EXISTS idx_memories_status ON event_memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_date   ON event_memories(event_date DESC);

-- ============================================================
-- MEMORY PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id  UUID NOT NULL REFERENCES event_memories(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memory_photos_memory_id ON memory_photos(memory_id);

-- ============================================================
-- MEMORY VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id     UUID NOT NULL REFERENCES event_memories(id) ON DELETE CASCADE,
  video_url     TEXT NOT NULL,
  title         TEXT,
  thumbnail_url TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memory_videos_memory_id ON memory_videos(memory_id);

-- ============================================================
-- BILINGUAL COLUMNS — Events
-- ============================================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS title_en             TEXT,
  ADD COLUMN IF NOT EXISTS short_description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en       TEXT;

-- ============================================================
-- BILINGUAL COLUMNS — News
-- ============================================================
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS title_en   TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT;

-- ============================================================
-- BILINGUAL COLUMNS — Event Memories
-- ============================================================
ALTER TABLE event_memories
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

-- ============================================================
-- UPDATED_AT TRIGGERS for new tables
-- ============================================================
DROP TRIGGER IF EXISTS trg_updated_at ON event_memories;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON event_memories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- GRANT PRIVILEGES on new tables to app user
-- ============================================================
GRANT ALL PRIVILEGES ON TABLE event_memories TO pramod_user;
GRANT ALL PRIVILEGES ON TABLE memory_photos  TO pramod_user;
GRANT ALL PRIVILEGES ON TABLE memory_videos  TO pramod_user;

-- ============================================================
-- Done. Verify with:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'events' AND column_name LIKE '%_en';
--
--   \d event_memories
--   \d memory_photos
--   \d memory_videos
-- ============================================================
