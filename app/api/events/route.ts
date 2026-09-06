import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';
import { translateBatch, isHindi } from '@/lib/translate';

// GET /api/events — public & admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode  = searchParams.get('admin') === '1';
    const statusParam = searchParams.get('status'); // e.g. "ongoing,upcoming" or single value
    const limitParam  = searchParams.get('limit');

    let sql = `SELECT * FROM events`;
    const params: unknown[] = [];

    if (!adminMode) {
      // Map friendly status names to DB status values
      const STATUS_MAP: Record<string, string[]> = {
        ongoing:  ['registration_open', 'published'],
        upcoming: ['registration_open', 'published'],
        published:['published'],
        completed:['completed'],
      };

      if (statusParam) {
        // Support comma-separated e.g. "ongoing,upcoming"
        const requested = statusParam.split(',').map(s => s.trim());
        // Collect matching DB statuses
        const dbStatuses = new Set<string>();

        // Check if any requested value is a raw DB status
        const rawStatuses = ['draft','published','registration_open','registration_closed','completed','cancelled'];
        for (const s of requested) {
          if (rawStatuses.includes(s)) {
            dbStatuses.add(s);
          } else if (STATUS_MAP[s]) {
            STATUS_MAP[s].forEach(v => dbStatuses.add(v));
          }
        }

        if (dbStatuses.size > 0) {
          const placeholders = [...dbStatuses].map((_, i) => `$${i + 1}`).join(',');
          sql += ` WHERE status IN (${placeholders})`;
          params.push(...dbStatuses);
        } else {
          sql += ` WHERE status IN ('published','registration_open','registration_closed','completed')`;
        }
      } else {
        sql += ` WHERE status IN ('published','registration_open','registration_closed','completed')`;
      }
    } else {
      if (statusParam && !statusParam.includes(',')) {
        sql += ` WHERE status = $1`;
        params.push(statusParam);
      }
    }

    sql += ` ORDER BY start_date ASC NULLS LAST, created_at DESC`;

    if (limitParam) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limitParam, 10));
    }

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
