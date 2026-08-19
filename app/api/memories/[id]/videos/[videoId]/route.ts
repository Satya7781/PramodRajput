import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

// DELETE /api/memories/[id]/videos/[videoId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const video = await queryOne(
      `DELETE FROM memory_videos WHERE id=$1 AND memory_id=$2 RETURNING id`,
      [params.videoId, params.id]
    );
    if (!video) return err('Video not found', 404);
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
