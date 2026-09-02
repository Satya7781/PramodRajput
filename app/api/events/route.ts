import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';
import { translateBatch, isHindi } from '@/lib/translate';

// GET /api/events — public & admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === '1';
    const statusFilter = searchParams.get('status');

    let sql = `SELECT * FROM events`;
    const params: unknown[] = [];

    if (!adminMode) {
      if (statusFilter) {
        sql += ` WHERE status = $1`;
        params.push(statusFilter);
      } else {
        sql += ` WHERE status IN ('published','registration_open','registration_closed','completed')`;
      }
    } else {
      if (statusFilter) { sql += ` WHERE status = $1`; params.push(statusFilter); }
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
      start_date, end_date, start_time, end_time, venue, address,
      registration_start, registration_end, max_participants,
      registration_enabled, certificate_enabled, status,
    } = body;

    if (!title || !slug) return err('Title and slug are required');

    // Auto-translate if admin didn't provide English versions manually
    let { title_en, short_description_en, description_en } = body as {
      title_en?: string; short_description_en?: string; description_en?: string;
    };

    const needsTranslation = isHindi(title);
    if (needsTranslation) {
      const textsToTranslate = [
        !title_en?.trim()             ? title             : null,
        !short_description_en?.trim() ? short_description : null,
        !description_en?.trim()       ? description       : null,
      ];
      const anyNeedsTranslation = textsToTranslate.some(t => t && t.trim());
      if (anyNeedsTranslation) {
        const [tTitle, tShort, tDesc] = await translateBatch(textsToTranslate);
        if (!title_en?.trim()             && tTitle) title_en = tTitle;
        if (!short_description_en?.trim() && tShort) short_description_en = tShort;
        if (!description_en?.trim()       && tDesc)  description_en = tDesc;
      }
    }

    const event = await queryOne(
      `INSERT INTO events
         (title, slug, short_description, description, banner_url,
          start_date, end_date, start_time, end_time, venue, address,
          registration_start, registration_end, max_participants,
          registration_enabled, certificate_enabled, status, created_by,
          title_en, short_description_en, description_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       RETURNING *`,
      [
        title, slug, short_description || null, description || null, banner_url || null,
        start_date || null, end_date || null, start_time || null, end_time || null,
        venue || null, address || null, registration_start || null, registration_end || null,
        max_participants || null, registration_enabled ?? false, certificate_enabled ?? false,
        status || 'draft', user.id,
        title_en || null, short_description_en || null, description_en || null,
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
