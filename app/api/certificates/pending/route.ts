import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse } from '@/lib/api-helpers';
import { query } from '@/lib/db';

// GET /api/certificates/pending — approved registrations without certificates
export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('event_id');

    let sql = `
      SELECT r.id, r.registration_number, r.event_id,
             (SELECT rv.value_text FROM registration_values rv 
              JOIN form_fields ff ON ff.id=rv.field_id 
              WHERE rv.registration_id=r.id 
              ORDER BY ff.sort_order LIMIT 1) as participant_name
      FROM registrations r
      WHERE r.status='approved'
        AND r.id NOT IN (SELECT registration_id FROM certificates)
    `;
    const params: unknown[] = [];
    if (eventId) { sql += ` AND r.event_id=$1`; params.push(eventId); }
    sql += ` ORDER BY r.submitted_at DESC`;

    const pending = await query(sql, params);
    return ok(pending);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
