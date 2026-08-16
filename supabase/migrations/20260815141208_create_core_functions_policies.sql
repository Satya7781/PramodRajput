/*
# Create Core Platform Tables — Part 2: Functions, Triggers, and RLS Policies

## Overview
This migration adds role-checking helper functions, auto-create profile trigger,
auto-generate registration number trigger, and all RLS policies for the core tables.

## Functions
- `is_admin()` — returns true if current user has admin role
- `is_editor()` — returns true if current user has admin or editor role
- `handle_new_user()` — auto-creates a profile row when a new auth user signs up
- `generate_registration_number()` — auto-generates unique registration numbers (PR-YYYY-NNNNNN)

## RLS Policies
- profiles: users read/update own; admins manage all
- events: public reads published; admins manage all
- event_forms: public reads active; admins manage all
- form_fields: public reads active; admins manage all
- form_field_options: public reads all; admins manage all
- registrations: public can insert (register); only admins can read/update/delete
- registration_values: public can insert; only admins can read/update/delete
*/

-- ============================================================
-- HELPER FUNCTIONS for role-based access control
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
    AND is_active = true
  );
$$;

-- ============================================================
-- TRIGGER: auto-create profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'editor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: auto-generate registration number
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num integer;
  year_str text;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 9 FOR 6) AS integer)), 0) + 1
  INTO next_num
  FROM public.registrations
  WHERE registration_number LIKE 'PR-' || year_str || '-%';
  NEW.registration_number := 'PR-' || year_str || '-' || lpad(next_num::text, 6, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_registration_number ON public.registrations;
CREATE TRIGGER trg_generate_registration_number
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  WHEN (NEW.registration_number IS NULL)
  EXECUTE FUNCTION public.generate_registration_number();

-- ============================================================
-- RLS POLICIES — profiles
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — events
-- ============================================================
DROP POLICY IF EXISTS "events_select_public_or_admin" ON public.events;
CREATE POLICY "events_select_public_or_admin" ON public.events FOR SELECT
  TO anon, authenticated USING (
    status IN ('published', 'registration_open', 'registration_closed', 'completed') OR public.is_admin()
  );

DROP POLICY IF EXISTS "events_insert_admin" ON public.events;
CREATE POLICY "events_insert_admin" ON public.events FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "events_update_admin" ON public.events;
CREATE POLICY "events_update_admin" ON public.events FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
CREATE POLICY "events_delete_admin" ON public.events FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — event_forms
-- ============================================================
DROP POLICY IF EXISTS "event_forms_select_public_or_admin" ON public.event_forms;
CREATE POLICY "event_forms_select_public_or_admin" ON public.event_forms FOR SELECT
  TO anon, authenticated USING (
    is_active = true OR public.is_admin()
  );

DROP POLICY IF EXISTS "event_forms_insert_admin" ON public.event_forms;
CREATE POLICY "event_forms_insert_admin" ON public.event_forms FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "event_forms_update_admin" ON public.event_forms;
CREATE POLICY "event_forms_update_admin" ON public.event_forms FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "event_forms_delete_admin" ON public.event_forms;
CREATE POLICY "event_forms_delete_admin" ON public.event_forms FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — form_fields
-- ============================================================
DROP POLICY IF EXISTS "form_fields_select_public_or_admin" ON public.form_fields;
CREATE POLICY "form_fields_select_public_or_admin" ON public.form_fields FOR SELECT
  TO anon, authenticated USING (
    is_active = true OR public.is_admin()
  );

DROP POLICY IF EXISTS "form_fields_insert_admin" ON public.form_fields;
CREATE POLICY "form_fields_insert_admin" ON public.form_fields FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "form_fields_update_admin" ON public.form_fields;
CREATE POLICY "form_fields_update_admin" ON public.form_fields FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "form_fields_delete_admin" ON public.form_fields;
CREATE POLICY "form_fields_delete_admin" ON public.form_fields FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — form_field_options
-- ============================================================
DROP POLICY IF EXISTS "form_field_options_select_public_or_admin" ON public.form_field_options;
CREATE POLICY "form_field_options_select_public_or_admin" ON public.form_field_options FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "form_field_options_insert_admin" ON public.form_field_options;
CREATE POLICY "form_field_options_insert_admin" ON public.form_field_options FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "form_field_options_update_admin" ON public.form_field_options;
CREATE POLICY "form_field_options_update_admin" ON public.form_field_options FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "form_field_options_delete_admin" ON public.form_field_options;
CREATE POLICY "form_field_options_delete_admin" ON public.form_field_options FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — registrations
-- ============================================================
DROP POLICY IF EXISTS "registrations_select_admin" ON public.registrations;
CREATE POLICY "registrations_select_admin" ON public.registrations FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "registrations_insert_public" ON public.registrations;
CREATE POLICY "registrations_insert_public" ON public.registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "registrations_update_admin" ON public.registrations;
CREATE POLICY "registrations_update_admin" ON public.registrations FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "registrations_delete_admin" ON public.registrations;
CREATE POLICY "registrations_delete_admin" ON public.registrations FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — registration_values
-- ============================================================
DROP POLICY IF EXISTS "registration_values_select_admin" ON public.registration_values;
CREATE POLICY "registration_values_select_admin" ON public.registration_values FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "registration_values_insert_public" ON public.registration_values;
CREATE POLICY "registration_values_insert_public" ON public.registration_values FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "registration_values_update_admin" ON public.registration_values;
CREATE POLICY "registration_values_update_admin" ON public.registration_values FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "registration_values_delete_admin" ON public.registration_values;
CREATE POLICY "registration_values_delete_admin" ON public.registration_values FOR DELETE
  TO authenticated USING (public.is_admin());
