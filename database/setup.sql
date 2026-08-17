-- ============================================================
-- Pramod Rajput Digital Platform — VPS PostgreSQL Setup Script
-- Run as postgres superuser:  psql -U postgres -f setup.sql
-- ============================================================

-- 1. Create database and user
-- (run these outside a transaction if needed)
-- CREATE DATABASE pramod_rajput;
-- CREATE USER pramod_user WITH ENCRYPTED PASSWORD 'change_this_strong_password';
-- GRANT ALL PRIVILEGES ON DATABASE pramod_rajput TO pramod_user;
-- \c pramod_rajput

-- Switch to the database before running the rest:
-- \c pramod_rajput

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (staff users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,           -- bcrypt hash; NULL for SSO / invite-only
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  short_description     TEXT,
  description           TEXT,
  banner_url            TEXT,
  start_date            DATE,
  end_date              DATE,
  start_time            TIME,
  end_time              TIME,
  venue                 TEXT,
  address               TEXT,
  registration_start    TIMESTAMPTZ,
  registration_end      TIMESTAMPTZ,
  max_participants      INTEGER,
  registration_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','published','registration_open','registration_closed','completed','cancelled')),
  created_by            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_slug   ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ============================================================
-- EVENT FORMS
-- ============================================================
CREATE TABLE IF NOT EXISTS event_forms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON event_forms(event_id);

-- ============================================================
-- FORM FIELDS
-- ============================================================
CREATE TABLE IF NOT EXISTS form_fields (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id          UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
  field_type       TEXT NOT NULL CHECK (field_type IN
                     ('text','textarea','email','phone','number','date',
                      'dropdown','radio','checkbox','file','image')),
  field_key        TEXT NOT NULL,
  label            TEXT NOT NULL,
  description      TEXT,
  placeholder      TEXT,
  is_required      BOOLEAN NOT NULL DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);

-- ============================================================
-- FORM FIELD OPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS form_field_options (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id   UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  value      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_ffo_field_id ON form_field_options(field_id);

-- ============================================================
-- REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT UNIQUE NOT NULL,
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  form_id             UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','cancelled')),
  submitted_at        TIMESTAMPTZ DEFAULT now(),
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status   ON registrations(status);

-- ============================================================
-- REGISTRATION VALUES
-- ============================================================
CREATE TABLE IF NOT EXISTS registration_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  field_id        UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  value_text      TEXT,
  value_json      JSONB,
  file_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reg_values_reg_id ON registration_values(registration_id);

-- ============================================================
-- NEWS CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS news_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  slug               TEXT UNIQUE NOT NULL,
  excerpt            TEXT,
  content            TEXT,
  featured_image_url TEXT,
  category_id        UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  status             TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','published','archived')),
  published_at       TIMESTAMPTZ,
  created_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_slug   ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);

-- ============================================================
-- PHOTO ALBUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS photo_albums (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  cover_image_url TEXT,
  event_id        UUID REFERENCES events(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'published'
                    CHECK (status IN ('draft','published','archived')),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id   UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);

-- ============================================================
-- VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  video_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  category      TEXT,
  status        TEXT NOT NULL DEFAULT 'published'
                  CHECK (status IN ('draft','published','archived')),
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CERTIFICATE TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificate_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  background_url TEXT,
  width       INTEGER NOT NULL DEFAULT 1200,
  height      INTEGER NOT NULL DEFAULT 850,
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape','portrait')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CERTIFICATE TEMPLATE FIELDS
-- ============================================================
CREATE TABLE IF NOT EXISTS certificate_template_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES certificate_templates(id) ON DELETE CASCADE,
  field_key   TEXT NOT NULL,
  label       TEXT NOT NULL,
  x_position  NUMERIC NOT NULL DEFAULT 0,
  y_position  NUMERIC NOT NULL DEFAULT 0,
  width       NUMERIC DEFAULT 300,
  height      NUMERIC DEFAULT 50,
  font_family TEXT DEFAULT 'Arial',
  font_size   INTEGER NOT NULL DEFAULT 24,
  font_weight TEXT DEFAULT 'normal',
  text_align  TEXT DEFAULT 'center' CHECK (text_align IN ('left','center','right')),
  color       TEXT DEFAULT '#000000',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number  TEXT UNIQUE NOT NULL,
  registration_id     UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_id         UUID NOT NULL REFERENCES certificate_templates(id) ON DELETE RESTRICT,
  participant_name    TEXT NOT NULL,
  pdf_url             TEXT,
  verification_token  TEXT UNIQUE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','revoked')),
  issued_at           TIMESTAMPTZ DEFAULT now(),
  revoked_at          TIMESTAMPTZ,
  revocation_reason   TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      JSONB,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER (applies to all mutable tables)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','events','event_forms','form_fields','registrations',
    'registration_values','news','photo_albums','videos',
    'certificate_templates','certificate_template_fields','certificates','site_settings'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- GRANT PRIVILEGES TO APP USER
-- ============================================================
GRANT USAGE ON SCHEMA public TO pramod_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pramod_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pramod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pramod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pramod_user;

-- ============================================================
-- DEFAULT SEED DATA
-- ============================================================

-- News categories
INSERT INTO news_categories (name, slug) VALUES
  ('Announcements', 'announcements'),
  ('Events',        'events'),
  ('Community',     'community'),
  ('Press',         'press')
ON CONFLICT (slug) DO NOTHING;

-- Site settings defaults
INSERT INTO site_settings (key, value) VALUES
  ('site_name',       '"Pramod Rajput"'),
  ('site_tagline',    '"Serving People, Building Tomorrow"'),
  ('contact_email',   '"pramodrajput0214@gmail.com"'),
  ('contact_phone',   '"+91 98067 31443"'),
  ('contact_address', '"श्री हरिहर नगर फन्दा कला, तह. हुजुर, जिला भोपाल (म.प्र.) 462030"'),
  ('hero_title',      '"Pramod Rajput"'),
  ('hero_tagline',    '"Dedicated to public service and community empowerment"'),
  ('about_text',      '""'),
  ('social_links',    '{"facebook":"","twitter":"","instagram":"","youtube":""}')
ON CONFLICT (key) DO NOTHING;

-- Default certificate template
INSERT INTO certificate_templates (name, description, width, height, orientation, is_active) VALUES
  ('Standard Certificate', 'Default participation certificate', 1200, 850, 'landscape', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CREATE FIRST ADMIN USER
-- Usage: replace the values below, then run this block.
-- Password is hashed with bcrypt (cost 10).
-- You can generate one with Node.js:
--   node -e "const b=require('bcryptjs');console.log(b.hashSync('yourpassword',10))"
-- ============================================================
-- INSERT INTO profiles (full_name, email, password_hash, role, is_active)
-- VALUES (
--   'Pramod Rajput',
--   'pramodrajput0214@gmail.com',
--   '$2a$10$REPLACE_WITH_BCRYPT_HASH_OF_YOUR_PASSWORD',
--   'admin',
--   true
-- )
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Done! Run the following to verify:
--   SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
-- ============================================================
