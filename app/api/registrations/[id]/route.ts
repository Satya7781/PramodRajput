import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/registrations/[id]/values — admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;

  try {
    const values = await query(
      `SELECT rv.value_text, rv.value_json, rv.file_url, ff.label, ff.field_type
       FROM registration_values rv
       LEFT JOIN form_fields ff ON ff.id = rv.field_id
       WHERE rv.registration_id = $1
       ORDER BY ff.sort_order`,
      [params.id]
    );
    // Normalise output: prefer value_text, fall back to file_url for file/image fields
    const normalised = (values as Array<{ value_text: string | null; value_json: unknown; file_url: string | null; label: string | null; field_type: string | null }>).map((v) => ({
      label: v.label ?? 'Unknown',
      value: v.file_url ?? v.value_text ?? '',
      field_type: v.field_type,
    }));
    return ok(normalised);
  } catch (e) {
    console.error('GET /api/registrations/[id] error:', e);
    return err('Internal server error', 500);
  }
}

// PUT /api/registrations/[id] — admin only: update status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  // ISSUE-14 fix: only admins can approve/reject registrations
  if (user.role !== 'admin') return err('Forbidden: admin access required', 403);

  try {
    const body = await req.json();
    const { status } = body as { status: string };

    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return err('Invalid status');
    }

    const registration = await queryOne(
      `UPDATE registrations SET status=$1, reviewed_at=now(), reviewed_by=$2, updated_at=now()
       WHERE id=$3 RETURNING *`,
      [status, user.id, params.id]
    );

    if (!registration) return err('Registration not found', 404);
    await writeAuditLog(user.id, `REGISTRATION_${status.toUpperCase()}`, 'registrations', params.id, { status });
    return ok(registration);
  } catch (e) {
    console.error('PUT /api/registrations/[id] error:', e);
    return err('Internal server error', 500);
  }
}
