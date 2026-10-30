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
    const search = searchParams.get('search')?.trim();

    // ISSUE-08 fix: use name_field_key from event_forms to correctly identify the name field.
    // Falls back to the first field by sort_order if no name_field_key is configured.
    let sql = `
      SELECT
        r.id,
        r.registration_number,
        r.event_id,
        COALESCE(
          -- Try name_field_key first
          (
            SELECT rv.value_text
            FROM registration_values rv
            JOIN form_fields ff ON ff.id = rv.field_id
            JOIN event_forms ef ON ef.id = ff.form_id
            WHERE rv.registration_id = r.id
              AND ff.field_key = ef.name_field_key
            LIMIT 1
          ),
          -- Fallback: first field by sort_order
          (
            SELECT rv.value_text
            FROM registration_values rv
            JOIN form_fields ff ON ff.id = rv.field_id
            WHERE rv.registration_id = r.id
            ORDER BY ff.sort_order
            LIMIT 1
          )
        ) AS participant_name
      FROM registrations r
      WHERE r.status = 'approved'
        AND r.id NOT IN (SELECT registration_id FROM certificates)
    `;
    const params: unknown[] = [];
    if (eventId) {
      sql += ` AND r.event_id = $1`;
      params.push(eventId);
    }
    if (search) {
      const searchParam = params.length + 1;
      sql += ` AND (
        r.registration_number ILIKE $${searchParam}
        OR EXISTS (
          SELECT 1
          FROM registration_values rv
          WHERE rv.registration_id = r.id
            AND COALESCE(rv.value_text, rv.file_url, '') ILIKE $${searchParam}
        )
      )`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY r.submitted_at DESC`;

    const pending = await query(sql, params);
    return ok(pending);
  } catch (e) {
    console.error('GET /api/certificates/pending error:', e);
    return err('Internal server error', 500);
  }
}
