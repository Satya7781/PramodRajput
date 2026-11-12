import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { query } from '@/lib/db';

// GET /api/gallery-events/featured — public
// Returns gallery events marked as featured (shown on homepage as Past Events)
export async function GET(_req: NextRequest) {
  try {
    const events = await query(
      `SELECT ge.id, ge.year, ge.name, ge.name_en, ge.slug,
              ge.description, ge.description_en, ge.cover_url, ge.is_featured,
              COUNT(gm.id) FILTER (WHERE gm.media_type = 'photo') AS photo_count,
              COUNT(gm.id) FILTER (WHERE gm.media_type = 'video') AS video_count
       FROM gallery_events ge
       LEFT JOIN gallery_media gm ON gm.event_id = ge.id
       WHERE ge.is_featured = TRUE
       GROUP BY ge.id
       ORDER BY ge.year DESC, ge.sort_order ASC`
    );
    return ok(events);
  } catch (e) {
    console.error('GET /api/gallery-events/featured error:', e);
    return err('Internal server error', 500);
  }
}
