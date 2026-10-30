import { NextRequest } from 'next/server';
import { ok, err, getAuthUser, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/registrations — admin only
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return err('Unauthorized', 401);

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    let sql = `
      SELECT r.*, e.title as event_title
      FROM registrations r
      LEFT JOIN events e ON e.id = r.event_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (eventId) { sql += ` AND r.event_id=$${idx++}`; params.push(eventId); }
    if (status) { sql += ` AND r.status=$${idx++}`; params.push(status); }
    if (search) {
      sql += ` AND (
        r.registration_number ILIKE $${idx}
        OR EXISTS (
          SELECT 1
          FROM registration_values rv
          WHERE rv.registration_id = r.id
            AND COALESCE(rv.value_text, rv.file_url, '') ILIKE $${idx}
        )
      )`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` ORDER BY r.submitted_at DESC`;

    const registrations = await query(sql, params);
    return ok(registrations);
  } catch (e) {
    console.error('GET /api/registrations error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/registrations — public (anyone can register)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_id, form_id, values } = body as {
      event_id: string;
      form_id: string;
      values: Array<{ field_id: string; value_text: string; file_url?: string }>;
    };

    if (!event_id || !form_id) return err('event_id and form_id are required');

    // Generate registration number atomically using a DB sequence to avoid race conditions
    const year = new Date().getFullYear().toString();
    const seqRow = await queryOne<{ nextval: string }>(
      `SELECT nextval('registration_number_seq') AS nextval`
    );
    const nextNum = parseInt(seqRow?.nextval ?? '1', 10).toString().padStart(6, '0');
    const registrationNumber = `PR-${year}-${nextNum}`;

    const registration = await queryOne(
      `INSERT INTO registrations (registration_number, event_id, form_id, status)
       VALUES ($1,$2,$3,'pending') RETURNING *`,
      [registrationNumber, event_id, form_id]
    );

    if (!registration) return err('Failed to create registration', 500);

    // Insert field values
    if (values && values.length > 0) {
      for (const v of values) {
        if (v.value_text || v.file_url) {
          // For checkbox (comma-separated), also store as JSON array in value_json
          const isMultiValue = v.value_text?.includes(',');
          const valueJson = isMultiValue
            ? JSON.stringify(v.value_text.split(',').filter(Boolean))
            : null;

          await query(
            `INSERT INTO registration_values (registration_id, field_id, value_text, value_json, file_url)
             VALUES ($1,$2,$3,$4,$5)`,
            [
              (registration as { id: string }).id,
              v.field_id,
              v.value_text || null,
              valueJson,
              (v as { field_id: string; value_text: string; file_url?: string }).file_url || null,
            ]
          );
        }
      }
    }

    return ok(registration, 201);
  } catch (e) {
    console.error('POST /api/registrations error:', e);
    return err('Internal server error', 500);
  }
}
