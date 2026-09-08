-- Add English translation columns to gallery_events
ALTER TABLE gallery_events
  ADD COLUMN IF NOT EXISTS name_en        TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;
