/*
# Seed Data and Updated_At Trigger

## Overview
This migration adds:
1. A generic trigger function to auto-update `updated_at` on any table.
2. Triggers on all tables that have `updated_at`.
3. Default site settings.
4. Default news categories.
5. A sample event with a registration form and fields.
6. Sample news articles.
7. A sample photo album with photos.
8. A sample video.
*/

-- ============================================================
-- Generic updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_event_forms_updated_at ON public.event_forms;
CREATE TRIGGER trg_event_forms_updated_at BEFORE UPDATE ON public.event_forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_form_fields_updated_at ON public.form_fields;
CREATE TRIGGER trg_form_fields_updated_at BEFORE UPDATE ON public.form_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_registrations_updated_at ON public.registrations;
CREATE TRIGGER trg_registrations_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_registration_values_updated_at ON public.registration_values;
CREATE TRIGGER trg_registration_values_updated_at BEFORE UPDATE ON public.registration_values
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_news_updated_at ON public.news;
CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_photo_albums_updated_at ON public.photo_albums;
CREATE TRIGGER trg_photo_albums_updated_at BEFORE UPDATE ON public.photo_albums
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_videos_updated_at ON public.videos;
CREATE TRIGGER trg_videos_updated_at BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_certificate_templates_updated_at ON public.certificate_templates;
CREATE TRIGGER trg_certificate_templates_updated_at BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_certificate_template_fields_updated_at ON public.certificate_template_fields;
CREATE TRIGGER trg_certificate_template_fields_updated_at BEFORE UPDATE ON public.certificate_template_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON public.certificates;
CREATE TRIGGER trg_certificates_updated_at BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Default site settings
-- ============================================================
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', '"Pramod Rajput"'::jsonb),
  ('site_tagline', '"Serving People, Building Tomorrow"'::jsonb),
  ('contact_email', '"contact@pramodrajput.com"'::jsonb),
  ('contact_phone', '"+91 98765 43210"'::jsonb),
  ('contact_address', '"123 Main Road, District HQ, Maharashtra, India"'::jsonb),
  ('social_links', '{"facebook": "https://facebook.com/pramodrajput", "twitter": "https://twitter.com/pramodrajput", "instagram": "https://instagram.com/pramodrajput", "youtube": "https://youtube.com/@pramodrajput"}'::jsonb),
  ('hero_title', '"Pramod Rajput"'::jsonb),
  ('hero_tagline', '"Dedicated to public service and community empowerment"'::jsonb),
  ('about_text', '"Pramod Rajput is a dedicated public servant and community leader committed to creating positive change through grassroots initiatives, educational programs, and social welfare activities."'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Default news categories
-- ============================================================
INSERT INTO public.news_categories (name, slug) VALUES
  ('Announcements', 'announcements'),
  ('Events', 'events'),
  ('Community', 'community'),
  ('Press', 'press')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Sample event
-- ============================================================
INSERT INTO public.events (
  title, slug, short_description, description, banner_url,
  start_date, end_date, start_time, end_time, venue, address,
  registration_start, registration_end, max_participants,
  registration_enabled, certificate_enabled, status
) VALUES
  (
    'Youth Leadership Summit 2026',
    'youth-leadership-summit-2026',
    'A two-day summit bringing together young leaders from across the state to discuss community development and leadership.',
    'The Youth Leadership Summit 2026 is a premier gathering of young visionaries, community workers, and change-makers. Over two immersive days, participants will engage in panel discussions, workshops, and networking sessions designed to cultivate leadership skills and foster collaborative community initiatives. The summit features keynote addresses from distinguished leaders, interactive breakout sessions on topics ranging from digital literacy to rural development, and a closing ceremony where certificates of participation will be distributed to all registered attendees.',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '2026-09-15', '2026-09-16', '09:00', '17:00',
    'Maharashtra State Convention Center', 'Shivaji Nagar, Pune, Maharashtra 411005',
    '2026-08-01 00:00:00+00', '2026-09-10 23:59:59+00', 500,
    true, true, 'registration_open'
  ),
  (
    'Community Health Awareness Camp',
    'community-health-awareness-camp',
    'A free health check-up and awareness camp organized for rural communities.',
    'The Community Health Awareness Camp is a grassroots initiative aimed at providing free medical consultations, health screenings, and awareness sessions to underserved rural communities. A team of volunteer doctors and healthcare professionals will offer general check-ups, blood pressure and sugar screening, and educational talks on preventive healthcare, nutrition, and hygiene.',
    'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '2026-10-05', '2026-10-05', '08:00', '14:00',
    'Rural Community Center', 'Village Panchayat Hall, District Jalna, Maharashtra',
    '2026-08-15 00:00:00+00', '2026-10-01 23:59:59+00', 200,
    true, false, 'published'
  ),
  (
    'Digital Literacy Workshop',
    'digital-literacy-workshop',
    'A hands-on workshop teaching digital skills to first-time technology users.',
    'This workshop is designed to bridge the digital divide by teaching essential digital skills to community members who have had limited access to technology. Topics include basic smartphone usage, internet safety, digital payments, accessing government services online, and using productivity tools.',
    'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '2026-11-20', '2026-11-20', '10:00', '16:00',
    'Community Digital Lab', 'Zilla Parishad Building, Beed, Maharashtra',
    '2026-09-01 00:00:00+00', '2026-11-15 23:59:59+00', 100,
    true, true, 'published'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Sample event form with fields for the Youth Leadership Summit
-- ============================================================
DO $$
DECLARE
  summit_event_id uuid;
  form_id uuid;
  field_id uuid;
BEGIN
  SELECT id INTO summit_event_id FROM public.events WHERE slug = 'youth-leadership-summit-2026' LIMIT 1;
  IF summit_event_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.event_forms (event_id, title, description, is_active)
  VALUES (summit_event_id, 'Youth Leadership Summit Registration', 'Please fill in all required fields to register for the summit.', true)
  RETURNING id INTO form_id;

  -- Full Name
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'text', 'full_name', 'Full Name', 'Enter your full name', true, 1)
  RETURNING id INTO field_id;

  -- Father Name
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'text', 'father_name', 'Father Name', 'Enter your father name', true, 2);

  -- Age
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'number', 'age', 'Age', 'Enter your age', true, 3);

  -- Gender
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'radio', 'gender', 'Gender', '', true, 4)
  RETURNING id INTO field_id;

  INSERT INTO public.form_field_options (field_id, label, value, sort_order) VALUES
    (field_id, 'Male', 'male', 1),
    (field_id, 'Female', 'female', 2),
    (field_id, 'Other', 'other', 3);

  -- Occupation
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'text', 'occupation', 'Occupation', 'Enter your occupation', false, 5);

  -- Organization
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'text', 'organization', 'Organization', 'Enter your organization name', false, 6);

  -- District
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'dropdown', 'district', 'District', 'Select your district', true, 7)
  RETURNING id INTO field_id;

  INSERT INTO public.form_field_options (field_id, label, value, sort_order) VALUES
    (field_id, 'Pune', 'pune', 1),
    (field_id, 'Mumbai', 'mumbai', 2),
    (field_id, 'Nagpur', 'nagpur', 3),
    (field_id, 'Aurangabad', 'aurangabad', 4),
    (field_id, 'Nashik', 'nashik', 5),
    (field_id, 'Jalna', 'jalna', 6),
    (field_id, 'Beed', 'beed', 7),
    (field_id, 'Other', 'other', 8);

  -- Email
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'email', 'email', 'Email Address', 'Enter your email address', true, 8);

  -- Phone
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'phone', 'phone', 'Phone Number', 'Enter your phone number', true, 9);

  -- Photo
  INSERT INTO public.form_fields (form_id, field_type, field_key, label, placeholder, is_required, sort_order)
  VALUES (form_id, 'image', 'photo', 'Passport Photo', 'Upload your passport-size photo', false, 10);
END $$;

-- ============================================================
-- Sample news articles
-- ============================================================
DO $$
DECLARE
  cat_events uuid;
  cat_community uuid;
  cat_press uuid;
BEGIN
  SELECT id INTO cat_events FROM public.news_categories WHERE slug = 'events' LIMIT 1;
  SELECT id INTO cat_community FROM public.news_categories WHERE slug = 'community' LIMIT 1;
  SELECT id INTO cat_press FROM public.news_categories WHERE slug = 'press' LIMIT 1;

  INSERT INTO public.news (title, slug, excerpt, content, featured_image_url, category_id, status, published_at) VALUES
    (
      'Record Turnout Expected at Youth Leadership Summit 2026',
      'record-turnout-youth-leadership-summit-2026',
      'Organizers anticipate over 500 young leaders to attend the two-day summit in Pune this September.',
      'The upcoming Youth Leadership Summit 2026 is generating unprecedented interest across the state, with registrations pouring in from young leaders in every district. The summit, organized under the initiative of Pramod Rajput, aims to bring together youth from diverse backgrounds to discuss community development, leadership, and social innovation.

The two-day event will feature keynote addresses from prominent leaders, interactive workshops on digital literacy and rural development, and networking opportunities designed to foster cross-district collaboration.

Registration is currently open and will close on September 10, 2026. All registered participants will receive a certificate of participation.',
      'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
      cat_events, 'published', now() - interval '3 days'
    ),
    (
      'Free Health Camp Brings Medical Care to Rural Communities',
      'free-health-camp-rural-communities',
      'Over 300 residents received free medical consultations at the community health awareness camp.',
      'A successful community health awareness camp was organized in the rural areas of Jalna district, bringing free medical consultations and health screenings to over 300 residents who have limited access to healthcare facilities.

The camp, supported by volunteer doctors and healthcare professionals, offered general check-ups, blood pressure and sugar screenings, and educational sessions on preventive healthcare and nutrition.

This initiative is part of an ongoing effort to bridge the healthcare gap between urban and rural communities in Maharashtra.',
      'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200',
      cat_community, 'published', now() - interval '7 days'
    ),
    (
      'Digital Literacy Program Reaches 10,000 Citizens Milestone',
      'digital-literacy-program-10000-citizens',
      'The flagship digital literacy initiative has now trained over 10,000 first-time technology users across the state.',
      'The digital literacy program, launched earlier this year, has reached a major milestone by training over 10,000 citizens across rural and semi-urban Maharashtra. The program focuses on teaching essential digital skills including smartphone usage, internet safety, digital payments, and accessing government services online.

Participants range from students to senior citizens, all benefiting from hands-on workshops conducted in community digital labs set up across multiple districts.

The next workshop is scheduled for November 20, 2026, in Beed district, with registration opening in September.',
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1200',
      cat_press, 'published', now() - interval '14 days'
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================================
-- Sample photo album with photos
-- ============================================================
DO $$
DECLARE
  album_id uuid;
BEGIN
  INSERT INTO public.photo_albums (title, slug, description, cover_image_url, status)
  VALUES (
    'Community Outreach Program 2026',
    'community-outreach-program-2026',
    'Photos from the community outreach initiative across rural Maharashtra.',
    'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'published'
  )
  RETURNING id INTO album_id;

  INSERT INTO public.photos (album_id, image_url, caption, sort_order) VALUES
    (album_id, 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800', 'Community gathering in Pune district', 1),
    (album_id, 'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=800', 'Interactive session with local youth', 2),
    (album_id, 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800', 'Workshop on community development', 3),
    (album_id, 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800', 'Group discussion with village leaders', 4),
    (album_id, 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=800', 'Training session for volunteers', 5),
    (album_id, 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800', 'Closing ceremony of the outreach program', 6)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- Sample videos
-- ============================================================
INSERT INTO public.videos (title, description, video_url, thumbnail_url, category, status) VALUES
  (
    'Youth Leadership Summit 2025 - Highlights',
    'A recap of last year summit featuring key moments, speaker highlights, and participant testimonials.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Events', 'published'
  ),
  (
    'Community Health Initiative - Documentary',
    'A short documentary on the community health awareness program and its impact on rural communities.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Community', 'published'
  ),
  (
    'Digital Literacy Workshop - Participant Stories',
    'Participants share their experiences learning digital skills through the community workshop program.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Education', 'published'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Sample certificate template
-- ============================================================
DO $$
DECLARE
  template_id uuid;
BEGIN
  INSERT INTO public.certificate_templates (name, description, background_url, width, height, orientation, is_active)
  VALUES (
    'Default Certificate Template',
    'Standard certificate template with participant name, event details, and QR code for verification.',
    'https://images.pexels.com/photos/220298/pexels-photo-220298.jpeg?auto=compress&cs=tinysrgb&w=1200',
    1200, 850, 'landscape', true
  )
  RETURNING id INTO template_id;

  INSERT INTO public.certificate_template_fields (template_id, field_key, label, x_position, y_position, width, height, font_family, font_size, font_weight, text_align, color) VALUES
    (template_id, 'participant_name', 'Participant Name', 600, 350, 500, 60, 'Georgia', 36, 'bold', 'center', '#1a1a1a'),
    (template_id, 'certificate_number', 'Certificate Number', 600, 550, 400, 30, 'Arial', 16, 'normal', 'center', '#555555'),
    (template_id, 'event_name', 'Event Name', 600, 250, 600, 50, 'Georgia', 28, 'bold', 'center', '#1a1a1a'),
    (template_id, 'event_date', 'Event Date', 600, 450, 400, 30, 'Arial', 18, 'normal', 'center', '#333333'),
    (template_id, 'event_venue', 'Venue', 600, 500, 400, 30, 'Arial', 18, 'normal', 'center', '#333333'),
    (template_id, 'registration_number', 'Registration Number', 600, 600, 400, 30, 'Arial', 14, 'normal', 'center', '#555555'),
    (template_id, 'qr_code', 'QR Code', 1050, 650, 120, 120, 'Arial', 12, 'normal', 'center', '#000000')
  ON CONFLICT DO NOTHING;
END $$;
