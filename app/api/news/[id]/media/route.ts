import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

type Params = { params: { id: string } };

// GET /api/news/[id]/media — public
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const media = await query(
      `SELECT * FROM news_media WHERE news_id=$1 ORDER BY sort_order ASC, created_at ASC`,
      [params.id]
    );
    return ok(media);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// POST /api/news/[id]/media — editor+
export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireEditor(req);
  if (isResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { media_type, url, caption, sort_order } = body;
    if (!media_type || !url) return err('media_type and url are required');
    if (!['photo', 'video', 'link'].includes(media_type)) return err('media_type must be photo, video, or link');

    const media = await queryOne(
      `INSERT INTO news_media (news_id, media_type, url, caption, sort_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [params.id, media_type, url, caption || null, sort_order ?? 0]
    );
    return ok(media, 201);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// DELETE /api/news/[id]/media?mediaId=xxx — editor+
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireEditor(req);
  if (isResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');
    if (!mediaId) return err('mediaId query param required');

    const media = await queryOne(
      `DELETE FROM news_media WHERE id=$1 AND news_id=$2 RETURNING id`,
      [mediaId, params.id]
    );
    if (!media) return err('Not found', 404);
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
