/*
# Create Core Platform Tables — Part 1: Tables and Indexes

## Overview
This migration creates the foundational tables for the Pramod Rajput Digital Platform.

## New Tables
1. profiles — authenticated staff (admins/editors)
2. events — event records with registration and certificate config
3. event_forms — registration forms per event
4. form_fields — dynamic fields per form
5. form_field_options — options for dropdown/radio/checkbox fields
6. registrations — registration submissions with unique numbers
7. registration_values — dynamic form responses (no hard-coded columns)
*/

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text,
  description text,
  banner_url text,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  venue text,
  address text,
  registration_start timestamptz,
  registration_end timestamptz,
  max_participants integer,
  registration_enabled boolean NOT NULL DEFAULT false,
  certificate_enabled boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'registration_open', 'registration_closed', 'completed', 'cancelled')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. event_forms
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.event_forms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. form_fields
-- ============================================================
CREATE TABLE IF NOT EXISTS public.form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.event_forms(id) ON DELETE CASCADE,
  field_type text NOT NULL CHECK (field_type IN ('text', 'textarea', 'email', 'phone', 'number', 'date', 'dropdown', 'radio', 'checkbox', 'file', 'image')),
  field_key text NOT NULL,
  label text NOT NULL,
  description text,
  placeholder text,
  is_required boolean NOT NULL DEFAULT false,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. form_field_options
-- ============================================================
CREATE TABLE IF NOT EXISTS public.form_field_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.form_field_options ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text UNIQUE NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  form_id uuid NOT NULL REFERENCES public.event_forms(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. registration_values
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registration_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  value_text text,
  value_json jsonb,
  file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.registration_values ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON public.event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_field_options_field_id ON public.form_field_options(field_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registration_values_registration_id ON public.registration_values(registration_id);
