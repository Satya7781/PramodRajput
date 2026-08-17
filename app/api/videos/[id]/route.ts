import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, description, video_url, thumbnail_url, category, status } = body;

    const video = await queryOne(
      `UPDATE videos SET title=$1,description=$2,video_url=$3,thumbnail_url=$4,category=$5,status=$6,updated_at=now()
       WHERE id=$7 RETURNING *`,
      [title, description || null, video_url, thumbnail_url || null, category || null, status || 'published', params.id]
    );

    if (!video) return err('Video not found', 404);
    await writeAuditLog(user.id, 'UPDATE_VIDEO', 'videos', params.id, { title });
    return ok(video);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const video = await queryOne(`DELETE FROM videos WHERE id=$1 RETURNING id`, [params.id]);
    if (!video) return err('Video not found', 404);
    await writeAuditLog(user.id, 'DELETE_VIDEO', 'videos', params.id, {});
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
