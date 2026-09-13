-- News media table for extra photos/videos per article
CREATE TABLE IF NOT EXISTS news_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id     UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  media_type  TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'link')),
  url         TEXT NOT NULL,
  caption     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_media_news_id ON news_media(news_id);
GRANT ALL PRIVILEGES ON news_media TO neondb_owner;
