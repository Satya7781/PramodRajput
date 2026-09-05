import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

type Params = { params: { id: string } };

// GET /api/gallery-events/[id]/media  — public
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const media = await query(
      `SELECT * FROM gallery_media WHERE event_id=$1 ORDER BY media_type ASC, sort_order ASC, created_at ASC`,
      [params.id]
    );
    return ok(media);
  } catch (e) {
    console.error('GET /api/gallery-events/[id]/media error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/gallery-events/[id]/media — admin only
export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req);
  if (isResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { media_type, url, thumbnail, caption, sort_order } = body;

    if (!media_type || !url) return err('media_type and url are required');
    if (!['photo', 'video'].includes(media_type)) return err('media_type must be photo or video');

    const media = await queryOne(
      `INSERT INTO gallery_media (event_id, media_type, url, thumbnail, caption, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [params.id, media_type, url, thumbnail || null, caption || null, sort_order ?? 0]
    );
    return ok(media, 201);
  } catch (e) {
    console.error('POST /api/gallery-events/[id]/media error:', e);
    return err('Internal server error', 500);
  }
}

// DELETE /api/gallery-events/[id]/media?mediaId=xxx — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req);
  if (isResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');
    if (!mediaId) return err('mediaId query param required');

    const media = await queryOne(
      `DELETE FROM gallery_media WHERE id=$1 AND event_id=$2 RETURNING id`,
      [mediaId, params.id]
    );
    if (!media) return err('Not found', 404);
    return ok({ success: true });
  } catch (e) {
    console.error('DELETE /api/gallery-events/[id]/media error:', e);
    return err('Internal server error', 500);
  }
}
