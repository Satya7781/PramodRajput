import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/gallery-events?year=2024  — public
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');

    if (year) {
      const events = await query(
        `SELECT ge.*,
                COUNT(gm.id) FILTER (WHERE gm.media_type = 'photo') AS photo_count,
                COUNT(gm.id) FILTER (WHERE gm.media_type = 'video') AS video_count
         FROM gallery_events ge
         LEFT JOIN gallery_media gm ON gm.event_id = ge.id
         WHERE ge.year = $1
         GROUP BY ge.id
         ORDER BY ge.sort_order ASC, ge.created_at ASC`,
        [parseInt(year)]
      );
      return ok(events);
    }

    // Return years that have at least one event, with counts
    const years = await query(
      `SELECT ge.year,
              COUNT(ge.id)                                        AS event_count,
              COUNT(gm.id) FILTER (WHERE gm.media_type = 'photo') AS photo_count,
              COUNT(gm.id) FILTER (WHERE gm.media_type = 'video') AS video_count
       FROM gallery_events ge
       LEFT JOIN gallery_media gm ON gm.event_id = ge.id
       GROUP BY ge.year
       ORDER BY ge.year DESC`
    );
    return ok(years);
  } catch (e) {
    console.error('GET /api/gallery-events error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/gallery-events — admin only
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isResponse(auth)) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { year, name, slug, description, cover_url, sort_order } = body;

    if (!year || !name || !slug) return err('year, name and slug are required');
    if (year < 2009 || year > 2028) return err('year must be between 2009 and 2028');

    const event = await queryOne(
      `INSERT INTO gallery_events (year, name, slug, description, cover_url, sort_order, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [year, name, slug, description || null, cover_url || null, sort_order ?? 0, user.id]
    );

    await writeAuditLog(user.id, 'CREATE_GALLERY_EVENT', 'gallery_events', (event as { id: string }).id, { name, year });
    return ok(event, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    console.error('POST /api/gallery-events error:', e);
    return err(msg, 500);
  }
}
