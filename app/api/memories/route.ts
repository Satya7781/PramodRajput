import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/memories — public (published) or admin (all)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === '1';
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    let sql = `
      SELECT
        m.*,
        (SELECT COUNT(*) FROM memory_photos  WHERE memory_id = m.id)::int AS photo_count,
        (SELECT COUNT(*) FROM memory_videos  WHERE memory_id = m.id)::int AS video_count
      FROM event_memories m
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (!adminMode) {
      sql += ` AND m.status = 'published'`;
    }

    if (search) {
      sql += ` AND (m.title ILIKE $${idx} OR m.location ILIKE $${idx} OR m.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` ORDER BY m.event_date DESC, m.created_at DESC`;

    if (limit) {
      sql += ` LIMIT $${idx}`;
      params.push(parseInt(limit, 10));
    }

    const memories = await query(sql, params);
    return ok(memories);
  } catch (e) {
    console.error('GET /api/memories error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/memories — editor+
export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, slug, event_date, location, description, cover_image_url, status } = body;

    if (!title?.trim()) return err('Title is required');
    if (!slug?.trim())  return err('Slug is required');
    if (!event_date)    return err('Event date is required');

    const memory = await queryOne(
      `INSERT INTO event_memories
         (title, slug, event_date, location, description, cover_image_url, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        title.trim(), slug.trim(), event_date,
        location?.trim() || null, description?.trim() || null,
        cover_image_url?.trim() || null, status || 'published', user.id,
      ]
    );

    await writeAuditLog(user.id, 'CREATE_MEMORY', 'event_memories', (memory as { id: string }).id, { title });
    return ok(memory, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    console.error('POST /api/memories error:', e);
    return err(msg, 500);
  }
}
