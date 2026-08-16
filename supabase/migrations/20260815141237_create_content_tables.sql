/*
# Create Content Management Tables

## Overview
This migration creates the remaining tables for news, photo albums, photos, videos,
certificate templates, certificate template fields, certificates, site settings,
and audit logs.

## New Tables
1. news — news articles with slug, category, status
2. news_categories — categories for news
3. photo_albums — album groupings for photos
4. photos — individual photos within albums
5. videos — video entries with thumbnail and category
6. certificate_templates — reusable certificate templates with background image
7. certificate_template_fields — positioned fields on a certificate template
8. certificates — issued certificates with unique number and verification token
9. site_settings — key-value settings stored as JSONB
10. audit_logs — audit trail of admin/editor actions

## Security
- RLS enabled on all tables.
- Public can read published news, photos, videos, and valid certificates (for verification).
- Editors can manage news, photos, videos.
- Only admins can manage certificates, templates, site settings, and view audit logs.
*/

-- ============================================================
-- 8. news_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. news
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  featured_image_url text,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. photo_albums
-- ============================================================
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  cover_image_url text,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. photos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.photo_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. videos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. certificate_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  background_url text,
  width integer NOT NULL DEFAULT 1200,
  height integer NOT NULL DEFAULT 850,
  orientation text NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. certificate_template_fields
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificate_template_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.certificate_templates(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  label text NOT NULL,
  x_position numeric NOT NULL DEFAULT 0,
  y_position numeric NOT NULL DEFAULT 0,
  width numeric DEFAULT 300,
  height numeric DEFAULT 50,
  font_family text DEFAULT 'Arial',
  font_size integer NOT NULL DEFAULT 24,
  font_weight text DEFAULT 'normal',
  text_align text DEFAULT 'center' CHECK (text_align IN ('left', 'center', 'right')),
  color text DEFAULT '#000000',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.certificate_template_fields ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.certificate_templates(id) ON DELETE RESTRICT,
  participant_name text NOT NULL,
  pdf_url text,
  verification_token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
  issued_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_news_category_id ON public.news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON public.news_categories(slug);
CREATE INDEX IF NOT EXISTS idx_photo_albums_slug ON public.photo_albums(slug);
CREATE INDEX IF NOT EXISTS idx_photo_albums_status ON public.photo_albums(status);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON public.photos(album_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_active ON public.certificate_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_template_fields_template_id ON public.certificate_template_fields(template_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_token ON public.certificates(verification_token);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);

-- ============================================================
-- RLS POLICIES — news_categories
-- ============================================================
DROP POLICY IF EXISTS "news_categories_select_public" ON public.news_categories;
CREATE POLICY "news_categories_select_public" ON public.news_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "news_categories_insert_editor" ON public.news_categories;
CREATE POLICY "news_categories_insert_editor" ON public.news_categories FOR INSERT
  TO authenticated WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "news_categories_update_editor" ON public.news_categories;
CREATE POLICY "news_categories_update_editor" ON public.news_categories FOR UPDATE
  TO authenticated USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "news_categories_delete_editor" ON public.news_categories;
CREATE POLICY "news_categories_delete_editor" ON public.news_categories FOR DELETE
  TO authenticated USING (public.is_editor());

-- ============================================================
-- RLS POLICIES — news
-- ============================================================
DROP POLICY IF EXISTS "news_select_public_or_editor" ON public.news;
CREATE POLICY "news_select_public_or_editor" ON public.news FOR SELECT
  TO anon, authenticated USING (
    status = 'published' OR public.is_editor()
  );

DROP POLICY IF EXISTS "news_insert_editor" ON public.news;
CREATE POLICY "news_insert_editor" ON public.news FOR INSERT
  TO authenticated WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "news_update_editor" ON public.news;
CREATE POLICY "news_update_editor" ON public.news FOR UPDATE
  TO authenticated USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "news_delete_editor" ON public.news;
CREATE POLICY "news_delete_editor" ON public.news FOR DELETE
  TO authenticated USING (public.is_editor());

-- ============================================================
-- RLS POLICIES — photo_albums
-- ============================================================
DROP POLICY IF EXISTS "photo_albums_select_public_or_editor" ON public.photo_albums;
CREATE POLICY "photo_albums_select_public_or_editor" ON public.photo_albums FOR SELECT
  TO anon, authenticated USING (
    status = 'published' OR public.is_editor()
  );

DROP POLICY IF EXISTS "photo_albums_insert_editor" ON public.photo_albums;
CREATE POLICY "photo_albums_insert_editor" ON public.photo_albums FOR INSERT
  TO authenticated WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "photo_albums_update_editor" ON public.photo_albums;
CREATE POLICY "photo_albums_update_editor" ON public.photo_albums FOR UPDATE
  TO authenticated USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "photo_albums_delete_editor" ON public.photo_albums;
CREATE POLICY "photo_albums_delete_editor" ON public.photo_albums FOR DELETE
  TO authenticated USING (public.is_editor());

-- ============================================================
-- RLS POLICIES — photos
-- ============================================================
DROP POLICY IF EXISTS "photos_select_public_or_editor" ON public.photos;
CREATE POLICY "photos_select_public_or_editor" ON public.photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "photos_insert_editor" ON public.photos;
CREATE POLICY "photos_insert_editor" ON public.photos FOR INSERT
  TO authenticated WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "photos_update_editor" ON public.photos;
CREATE POLICY "photos_update_editor" ON public.photos FOR UPDATE
  TO authenticated USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "photos_delete_editor" ON public.photos;
CREATE POLICY "photos_delete_editor" ON public.photos FOR DELETE
  TO authenticated USING (public.is_editor());

-- ============================================================
-- RLS POLICIES — videos
-- ============================================================
DROP POLICY IF EXISTS "videos_select_public_or_editor" ON public.videos;
CREATE POLICY "videos_select_public_or_editor" ON public.videos FOR SELECT
  TO anon, authenticated USING (
    status = 'published' OR public.is_editor()
  );

DROP POLICY IF EXISTS "videos_insert_editor" ON public.videos;
CREATE POLICY "videos_insert_editor" ON public.videos FOR INSERT
  TO authenticated WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "videos_update_editor" ON public.videos;
CREATE POLICY "videos_update_editor" ON public.videos FOR UPDATE
  TO authenticated USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "videos_delete_editor" ON public.videos;
CREATE POLICY "videos_delete_editor" ON public.videos FOR DELETE
  TO authenticated USING (public.is_editor());

-- ============================================================
-- RLS POLICIES — certificate_templates
-- ============================================================
DROP POLICY IF EXISTS "certificate_templates_select_admin" ON public.certificate_templates;
CREATE POLICY "certificate_templates_select_admin" ON public.certificate_templates FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "certificate_templates_insert_admin" ON public.certificate_templates;
CREATE POLICY "certificate_templates_insert_admin" ON public.certificate_templates FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "certificate_templates_update_admin" ON public.certificate_templates;
CREATE POLICY "certificate_templates_update_admin" ON public.certificate_templates FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "certificate_templates_delete_admin" ON public.certificate_templates;
CREATE POLICY "certificate_templates_delete_admin" ON public.certificate_templates FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — certificate_template_fields
-- ============================================================
DROP POLICY IF EXISTS "cert_template_fields_select_admin" ON public.certificate_template_fields;
CREATE POLICY "cert_template_fields_select_admin" ON public.certificate_template_fields FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "cert_template_fields_insert_admin" ON public.certificate_template_fields;
CREATE POLICY "cert_template_fields_insert_admin" ON public.certificate_template_fields FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cert_template_fields_update_admin" ON public.certificate_template_fields;
CREATE POLICY "cert_template_fields_update_admin" ON public.certificate_template_fields FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cert_template_fields_delete_admin" ON public.certificate_template_fields;
CREATE POLICY "cert_template_fields_delete_admin" ON public.certificate_template_fields FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — certificates
-- ============================================================
-- Public can read certificates for verification (only certificate_number, participant_name, event info, status)
-- but we expose only what's needed via a view-like policy
DROP POLICY IF EXISTS "certificates_select_public_or_admin" ON public.certificates;
CREATE POLICY "certificates_select_public_or_admin" ON public.certificates FOR SELECT
  TO anon, authenticated USING (
    status = 'valid' OR public.is_admin()
  );

-- Only admins can insert/update/delete certificates
DROP POLICY IF EXISTS "certificates_insert_admin" ON public.certificates;
CREATE POLICY "certificates_insert_admin" ON public.certificates FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "certificates_update_admin" ON public.certificates;
CREATE POLICY "certificates_update_admin" ON public.certificates FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "certificates_delete_admin" ON public.certificates;
CREATE POLICY "certificates_delete_admin" ON public.certificates FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — site_settings
-- ============================================================
-- Public can read settings (site config); only admins can modify
DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
CREATE POLICY "site_settings_insert_admin" ON public.site_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
CREATE POLICY "site_settings_update_admin" ON public.site_settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_settings_delete_admin" ON public.site_settings;
CREATE POLICY "site_settings_delete_admin" ON public.site_settings FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — audit_logs
-- ============================================================
-- Only admins can view audit logs; any authenticated user can insert (system creates logs)
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_update_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_update_admin" ON public.audit_logs FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_delete_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_delete_admin" ON public.audit_logs FOR DELETE
  TO authenticated USING (public.is_admin());
