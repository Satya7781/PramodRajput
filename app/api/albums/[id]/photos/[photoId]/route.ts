import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const photo = await queryOne(
      `DELETE FROM photos WHERE id=$1 AND album_id=$2 RETURNING id`,
      [params.photoId, params.id]
    );
    if (!photo) return err('Photo not found', 404);
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
