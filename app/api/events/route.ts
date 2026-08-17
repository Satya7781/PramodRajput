import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/events — public & admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === '1';
    const statusFilter = searchParams.get('status');

    let sql = `SELECT * FROM events`;
    const params: unknown[] = [];

    if (!adminMode) {
      // Public: only published events
      if (statusFilter) {
        sql += ` WHERE status = $1`;
        params.push(statusFilter);
      } else {
        sql += ` WHERE status IN ('published','registration_open','registration_closed','completed')`;
      }
    } else {
      // Admin: all events, optionally filtered
      if (statusFilter) {
        sql += ` WHERE status = $1`;
        params.push(statusFilter);
      }
    }

    sql += ` ORDER BY created_at DESC`;

    const events = await query(sql, params);
    return ok(events);
  } catch (e) {
    console.error('GET /api/events error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/events — admin only
export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const body = await req.json();
    const {
      title, slug, short_description, description, banner_url,
      start_date, end_date, start_time, end_time,
      venue, address, registration_start, registration_end,
      max_participants, registration_enabled, certificate_enabled, status,
    } = body;

    if (!title || !slug) return err('Title and slug are required');

    const event = await queryOne(
      `INSERT INTO events
         (title, slug, short_description, description, banner_url,
          start_date, end_date, start_time, end_time,
          venue, address, registration_start, registration_end,
          max_participants, registration_enabled, certificate_enabled, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        title, slug, short_description || null, description || null, banner_url || null,
        start_date || null, end_date || null, start_time || null, end_time || null,
        venue || null, address || null, registration_start || null, registration_end || null,
        max_participants || null, registration_enabled ?? false, certificate_enabled ?? false,
        status || 'draft', user.id,
      ]
    );

    await writeAuditLog(user.id, 'CREATE_EVENT', 'events', (event as { id: string }).id, { title });
    return ok(event, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    console.error('POST /api/events error:', e);
    return err(msg, 500);
  }
}
