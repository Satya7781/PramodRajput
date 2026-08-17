import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const album = await queryOne(`SELECT * FROM photo_albums WHERE id=$1`, [params.id]);
    if (!album) return err('Album not found', 404);
    return ok(album);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, slug, description, cover_image_url, status, event_id } = body;

    const album = await queryOne(
      `UPDATE photo_albums SET title=$1,slug=$2,description=$3,cover_image_url=$4,status=$5,event_id=$6,updated_at=now()
       WHERE id=$7 RETURNING *`,
      [title, slug, description || null, cover_image_url || null, status || 'published', event_id || null, params.id]
    );

    if (!album) return err('Album not found', 404);
    await writeAuditLog(user.id, 'UPDATE_ALBUM', 'photo_albums', params.id, { title });
    return ok(album);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const album = await queryOne(`DELETE FROM photo_albums WHERE id=$1 RETURNING id`, [params.id]);
    if (!album) return err('Album not found', 404);
    await writeAuditLog(user.id, 'DELETE_ALBUM', 'photo_albums', params.id, {});
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
