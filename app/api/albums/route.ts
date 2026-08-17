import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/albums — public & admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === '1';
    const limit = searchParams.get('limit');

    let sql = `SELECT * FROM photo_albums WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (!adminMode) {
      sql += ` AND status='published'`;
    }

    sql += ` ORDER BY created_at DESC`;
    if (limit) { sql += ` LIMIT $${idx++}`; params.push(parseInt(limit, 10)); }

    const albums = await query(sql, params);
    return ok(albums);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// POST /api/albums — editor+
export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, slug, description, cover_image_url, status, event_id } = body;

    if (!title || !slug) return err('Title and slug are required');

    const album = await queryOne(
      `INSERT INTO photo_albums (title, slug, description, cover_image_url, status, event_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, slug, description || null, cover_image_url || null, status || 'published', event_id || null, user.id]
    );

    await writeAuditLog(user.id, 'CREATE_ALBUM', 'photo_albums', (album as { id: string }).id, { title });
    return ok(album, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}
