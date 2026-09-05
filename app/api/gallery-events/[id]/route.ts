import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

type Params = { params: { id: string } };

// GET /api/gallery-events/[id]  — public (fetch by id OR slug)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const event = await queryOne(
      `SELECT ge.*,
              COUNT(gm.id) FILTER (WHERE gm.media_type = 'photo') AS photo_count,
              COUNT(gm.id) FILTER (WHERE gm.media_type = 'video') AS video_count
       FROM gallery_events ge
       LEFT JOIN gallery_media gm ON gm.event_id = ge.id
       WHERE ge.id = $1 OR ge.slug = $1
       GROUP BY ge.id`,
      [id]
    );
    if (!event) return err('Not found', 404);
    return ok(event);
  } catch (e) {
    console.error('GET /api/gallery-events/[id] error:', e);
    return err('Internal server error', 500);
  }
}

// PATCH /api/gallery-events/[id] — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req);
  if (isResponse(auth)) return auth;
  const { user } = auth;

  try {
    const { id } = params;
    const body = await req.json();
    const { year, name, slug, description, cover_url, sort_order } = body;

    const event = await queryOne(
      `UPDATE gallery_events
       SET year=$1, name=$2, slug=$3, description=$4, cover_url=$5, sort_order=$6, updated_at=now()
       WHERE id=$7 RETURNING *`,
      [year, name, slug, description || null, cover_url || null, sort_order ?? 0, id]
    );
    if (!event) return err('Not found', 404);

    await writeAuditLog(user.id, 'UPDATE_GALLERY_EVENT', 'gallery_events', id, { name });
    return ok(event);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}

// DELETE /api/gallery-events/[id] — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req);
  if (isResponse(auth)) return auth;
  const { user } = auth;

  try {
    const { id } = params;
    const event = await queryOne(`DELETE FROM gallery_events WHERE id=$1 RETURNING id,name`, [id]);
    if (!event) return err('Not found', 404);

    await writeAuditLog(user.id, 'DELETE_GALLERY_EVENT', 'gallery_events', id, {});
    return ok({ success: true });
  } catch (e) {
    console.error('DELETE /api/gallery-events/[id] error:', e);
    return err('Internal server error', 500);
  }
}
