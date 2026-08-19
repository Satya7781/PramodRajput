import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/memories/[id] — get memory with photos + videos
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const memory = await queryOne(`SELECT * FROM event_memories WHERE id = $1`, [params.id]);
    if (!memory) return err('Memory not found', 404);

    const [photos, videos] = await Promise.all([
      query(`SELECT * FROM memory_photos WHERE memory_id=$1 ORDER BY sort_order`, [params.id]),
      query(`SELECT * FROM memory_videos WHERE memory_id=$1 ORDER BY sort_order`, [params.id]),
    ]);

    return ok({ ...memory, memory_photos: photos, memory_videos: videos });
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// PUT /api/memories/[id] — update memory metadata
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, slug, event_date, location, description, cover_image_url, status } = body;

    if (!title?.trim()) return err('Title is required');
    if (!slug?.trim())  return err('Slug is required');
    if (!event_date)    return err('Event date is required');

    const memory = await queryOne(
      `UPDATE event_memories SET
         title=$1, slug=$2, event_date=$3, location=$4, description=$5,
         cover_image_url=$6, status=$7, updated_at=now()
       WHERE id=$8 RETURNING *`,
      [
        title.trim(), slug.trim(), event_date,
        location?.trim() || null, description?.trim() || null,
        cover_image_url?.trim() || null, status || 'published', params.id,
      ]
    );

    if (!memory) return err('Memory not found', 404);
    await writeAuditLog(user.id, 'UPDATE_MEMORY', 'event_memories', params.id, { title });
    return ok(memory);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}

// DELETE /api/memories/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const memory = await queryOne(
      `DELETE FROM event_memories WHERE id=$1 RETURNING id, title`, [params.id]
    );
    if (!memory) return err('Memory not found', 404);
    await writeAuditLog(user.id, 'DELETE_MEMORY', 'event_memories', params.id, {});
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
