-- ============================================================
-- Migration v3 — Flat social links + secondary phone
-- Run on existing databases that were set up with setup.sql v1 or v2
--
-- Run on VPS:
--   psql -U pramod_user -d pramod_rajput -f database/migration_v3.sql
-- ============================================================

-- Add secondary phone setting if not present
INSERT INTO site_settings (key, value)
VALUES ('contact_phone_secondary', '"+91 98938 36607"')
ON CONFLICT (key) DO NOTHING;

-- Migrate social_links JSON object → individual flat keys
-- (this is safe to run even if social_links doesn't exist)
DO $$
DECLARE
  social_val JSONB;
BEGIN
  SELECT value::JSONB INTO social_val
  FROM site_settings
  WHERE key = 'social_links';

  IF social_val IS NOT NULL THEN
    INSERT INTO site_settings (key, value)
    VALUES
      ('facebook',  to_json(COALESCE(social_val->>'facebook',  ''))::TEXT),
      ('twitter',   to_json(COALESCE(social_val->>'twitter',   ''))::TEXT),
      ('instagram', to_json(COALESCE(social_val->>'instagram', ''))::TEXT),
      ('youtube',   to_json(COALESCE(social_val->>'youtube',   ''))::TEXT)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

    -- Remove the now-redundant nested key
    DELETE FROM site_settings WHERE key = 'social_links';
    RAISE NOTICE 'Migrated social_links → flat keys (facebook, twitter, instagram, youtube)';
  ELSE
    -- Just ensure flat keys exist with empty defaults
    INSERT INTO site_settings (key, value) VALUES
      ('facebook',  '""'),
      ('twitter',   '""'),
      ('instagram', '""'),
      ('youtube',   '""')
    ON CONFLICT (key) DO NOTHING;
    RAISE NOTICE 'social_links not found; ensured flat keys exist.';
  END IF;
END $$;

-- Confirm final state
SELECT key, value FROM site_settings WHERE key IN (
  'site_name', 'contact_email', 'contact_phone', 'contact_phone_secondary',
  'contact_address', 'facebook', 'twitter', 'instagram', 'youtube'
) ORDER BY key;
