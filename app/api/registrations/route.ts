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
      values: Array<{ field_id: string; value_text: string }>;
    };

    if (!event_id || !form_id) return err('event_id and form_id are required');

    // Generate registration number: PR-YYYY-NNNNNN
    const year = new Date().getFullYear().toString();
    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM registrations WHERE registration_number LIKE $1`,
      [`PR-${year}-%`]
    );
    const nextNum = (parseInt(countRow?.count ?? '0', 10) + 1).toString().padStart(6, '0');
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
        if (v.value_text) {
          await query(
            `INSERT INTO registration_values (registration_id, field_id, value_text)
             VALUES ($1,$2,$3)`,
            [(registration as { id: string }).id, v.field_id, v.value_text]
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
