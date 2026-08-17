import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const body = await req.json();
    const { status, revocation_reason } = body as { status: 'valid' | 'revoked'; revocation_reason?: string };

    const cert = await queryOne(
      `UPDATE certificates SET
         status=$1,
         revoked_at = CASE WHEN $1='revoked' THEN now() ELSE NULL END,
         revocation_reason = CASE WHEN $1='revoked' THEN $2 ELSE NULL END,
         updated_at=now()
       WHERE id=$3 RETURNING *`,
      [status, revocation_reason || 'Revoked by admin', params.id]
    );

    if (!cert) return err('Certificate not found', 404);
    await writeAuditLog(user.id, status === 'revoked' ? 'REVOKE_CERTIFICATE' : 'REINSTATE_CERTIFICATE', 'certificates', params.id, {});
    return ok(cert);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
