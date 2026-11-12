import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

type Params = { params: { id: string } };

// PATCH /api/gallery-events/[id]/feature — admin: toggle is_featured
// Body: { is_featured: boolean }
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req);
  if (isResponse(auth)) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const featured = Boolean(body.is_featured);

    const event = await queryOne(
      `UPDATE gallery_events SET is_featured=$1, updated_at=now() WHERE id=$2 RETURNING id, name, is_featured`,
      [featured, params.id]
    );
    if (!event) return err('Gallery event not found', 404);

    await writeAuditLog(user.id, featured ? 'FEATURE_GALLERY_EVENT' : 'UNFEATURE_GALLERY_EVENT', 'gallery_events', params.id, {});
    return ok(event);
  } catch (e) {
    console.error('PATCH /api/gallery-events/[id]/feature error:', e);
    return err('Internal server error', 500);
  }
}
