import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/albums/[id]/photos
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const photos = await query(
      `SELECT * FROM photos WHERE album_id=$1 ORDER BY sort_order`,
      [params.id]
    );
    return ok(photos);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// POST /api/albums/[id]/photos
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const { image_url, caption } = body as { image_url: string; caption?: string };

    if (!image_url) return err('image_url is required');

    // Get next sort order
    const maxRow = await queryOne<{ max: number | null }>(
      `SELECT MAX(sort_order) as max FROM photos WHERE album_id=$1`, [params.id]
    );
    const sort_order = (maxRow?.max ?? -1) + 1;

    const photo = await queryOne(
      `INSERT INTO photos (album_id, image_url, caption, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [params.id, image_url, caption || null, sort_order]
    );

    return ok(photo, 201);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
