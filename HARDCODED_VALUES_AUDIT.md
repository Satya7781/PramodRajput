# Hardcoded Values Audit

## Summary

Full audit of the codebase for hardcoded values. All dynamic configuration has been moved to environment variables or the database `site_settings` table, which the admin can update through the Settings panel.

---

## ✅ Fixed — Previously Hardcoded, Now Dynamic

### 1. Contact Information (email, phone, address)
| Location | Was | Now |
|---|---|---|
| `components/site/site-footer.tsx` | Hardcoded email/phone/address strings | Reads from `useSiteSettings()` context |
| `app/(public)/contact/page.tsx` | Hardcoded email/phone/address strings | Reads from `useSiteSettings()` context |
| `app/admin/dashboard/settings/page.tsx` | Hardcoded placeholder defaults | Empty defaults; real data lives in DB |

### 2. Site Name & Branding
| Location | Was | Now |
|---|---|---|
| `components/site/site-header.tsx` | `"Pramod Rajput"`, `"PR"` initials | Reads `settings.site_name`, derives initials dynamically |
| `components/site/site-footer.tsx` | `"Pramod Rajput"` in brand area | Reads `settings.site_name` |
| `app/layout.tsx` | Hardcoded `<title>` and meta description | Reads from `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_TAGLINE`, `NEXT_PUBLIC_SITE_DESC` env vars with sensible fallbacks |

### 3. Social Media Links
| Location | Was | Now |
|---|---|---|
| `components/site/site-footer.tsx` | `href="#"` on all social icons | Reads `facebook`, `twitter`, `instagram`, `youtube` from `site_settings`; hides icons when empty |
| `app/(public)/contact/page.tsx` | `href="#"` on all social icons | Same — only renders social section if URLs are set |
| `database/setup.sql` | Nested `social_links` JSON key | Flat individual keys (`facebook`, `twitter`, etc.) |

### 4. Secondary Phone Number
| Location | Was | Now |
|---|---|---|
| `components/site/site-footer.tsx` | Hardcoded `+91 98938 36607` | Reads `contact_phone_secondary` from `site_settings` |
| `app/(public)/contact/page.tsx` | Hardcoded second phone entry | Reads `contact_phone_secondary` |
| `database/setup.sql` | Missing entirely | Added `contact_phone_secondary` seed row |

### 5. Admin Settings Form
| Location | Was | Now |
|---|---|---|
| `app/admin/dashboard/settings/page.tsx` | Saved social links as nested `social_links` object | Saves all as flat keys; added secondary phone field |

---

## ✅ Fixed — TypeScript Errors

| File | Error | Fix |
|---|---|---|
| `app/admin/dashboard/memories/page.tsx` | `autoTranslate` and `translating` referenced but never declared | Added missing `useAutoTranslate()` hook call inside component |

---

## ✅ New Files Created

| File | Purpose |
|---|---|
| `.env.example` | Template for all required environment variables with documentation |
| `lib/site-settings-context.tsx` | React context that fetches `/api/settings` once and provides values to all public components |
| `lib/env-validator.ts` | Server-side validation of required env vars at startup — warns in dev, throws in production |
| `instrumentation.ts` | Next.js instrumentation hook that runs `validateEnv()` on server start |
| `database/migration_v3.sql` | Migration for existing DBs: adds `contact_phone_secondary`, migrates `social_links` → flat keys |

---

## ✅ Environment Variables

See `.env.example` for the full documented list. Required variables:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL for SSR fetches and upload URL construction |
| `DB_HOST` | ✅ | PostgreSQL host |
| `DB_NAME` | ✅ | PostgreSQL database name |
| `DB_USER` | ✅ | PostgreSQL user |
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `DB_PORT` | optional | PostgreSQL port (default: 5432) |
| `DB_SSL` | optional | Enable SSL for PostgreSQL connection |
| `JWT_EXPIRES_IN` | optional | JWT expiry duration (default: 7d) |
| `NEXT_PUBLIC_SITE_NAME` | optional | SEO page title override |
| `NEXT_PUBLIC_SITE_TAGLINE` | optional | SEO tagline override |
| `NEXT_PUBLIC_SITE_DESC` | optional | SEO meta description override |
| `NEXT_PUBLIC_OG_IMAGE` | optional | OpenGraph image URL |

---

## ℹ️ Intentional — Not Hardcoded Issues

These contain the person's name/info by design:

| Location | Reason |
|---|---|
| `lib/i18n.tsx` | Bilingual UI copy — translatable strings used across the whole site. Changing them requires editing the i18n file directly, which is the correct workflow. |
| `database/setup.sql` — seed data | Initial DB seed values that admin will overwrite via the Settings panel on first run. Comments clarify this. |
| `database/migration_v3.sql` — SQL comments | Documentation only, not executed as data. |
| `TRANSLATION_SETUP.md` | Documentation file — psql CLI examples use the real DB name for clarity. |
| `CODEBASE_ANALYSIS.md` | Analysis document only. |

---

## How to Update Site Information (Admin Guide)

1. Log in to the admin dashboard.
2. Go to **Settings**.
3. Update Site Name, contact details, social media links, etc.
4. Click **Save Settings**.

Changes are reflected immediately on all public pages — no redeploy needed.

---

## Database Setup for New Installs

```bash
# 1. Run the full setup (creates all tables + seeds default settings)
psql -U postgres -f database/setup.sql

# 2. Edit site_settings defaults after setup via admin panel
#    or directly in the DB:
UPDATE site_settings SET value = '"your@email.com"' WHERE key = 'contact_email';
```

## Database Migration for Existing Installs

```bash
# Migrates social_links → flat keys, adds contact_phone_secondary
psql -U your_user -d your_db -f database/migration_v3.sql
```
