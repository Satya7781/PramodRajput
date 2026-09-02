# Auto-Translation System Setup

## What this does
1. **Admin posts in Hindi** → automatically appears in **both Hindi and English** on the website
2. **On-demand translation** → "Auto-translate Hindi→English" button in admin forms to preview before saving
3. **Free, no API key required** → Uses MyMemory Translation API (5,000 words/day free tier)

## Database setup
Run the migration on your PostgreSQL VPS:

```bash
psql -U pramod_user -d pramod_rajput -f database/add_bilingual_columns.sql
```

This adds `*_en` columns for English translations.

## How it works

### Frontend (admin forms)
All 3 admin forms now have:
- Blue `EN` badge for English fields
- **Auto-translate button** → translates Hindi text to English using MyMemory
- Admin can edit translations before saving

### Backend (API routes)
When admin saves a post:
1. API detects if content contains Devanagari (Hindi) script
2. If English fields (`title_en`, `description_en`, etc.) are empty
3. Calls MyMemory API to translate missing English versions
4. Stores both Hindi + English versions in the database

### Frontend display
When user switches language (Hindi/English toggle):
- If language = English → shows `*_en` fields if they exist
- If `*_en` fields are empty → gracefully falls back to Hindi original
- If language = Hindi → always shows Hindi original

## Files created/modified

### Core translation engine
- `lib/translate.ts` → MyMemory API wrapper with chunking, retry, fallback, Hindi detection
- `lib/use-translate.ts` → React hook for auto-translate button
- `app/api/translate/route.ts` → on-demand translation endpoint

### API routes with auto-translation
- `app/api/events/route.ts` & `/[id]/route.ts`
- `app/api/news/route.ts` & `/[id]/route.ts`
- `app/api/memories/route.ts` & `/[id]/route.ts`

### Admin forms with translation button
- `components/admin/event-form.tsx`
- `app/admin/dashboard/news/page.tsx`
- `app/admin/dashboard/memories/page.tsx`

## MyMemory API details
- **Free tier**: 5,000 words/day (plenty for a political website)
- **No API key needed** → completely anonymous requests
- **Hindi ↔ English** support
- **Rate limits**: ~20 requests/minute (our code respects this with delays)
- **Fallback**: If translation fails, keeps Hindi text (no data loss)

## Testing the system
1. Go to any admin form (Events, News, Memories)
2. Type Hindi text in the Hindi fields
3. Click "Auto-translate Hindi→English" button
4. Verify English translation appears in English fields
5. Save → content will be available in both languages on the website

## Maintenance
- The system is completely automatic and requires no maintenance
- If MyMemory quota is exceeded for a day, translation will skip (no errors)
- All translations are cached in your database (no repeat API calls for same content)
- You can always manually edit English translations later

## Benefits
✅ **Zero cost** – MyMemory free tier covers all needs  
✅ **Zero setup** – No API keys, registration, or payments  
✅ **Automatic** – Posts appear in both languages instantly  
✅ **Fallback safe** – If translation fails, keeps original text  
✅ **Admin preview** – See translation before publishing  
✅ **Full control** – Manually edit any auto-translation