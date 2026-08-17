import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === '1';
    const limit = searchParams.get('limit');

    let sql = `SELECT * FROM videos WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (!adminMode) { sql += ` AND status='published'`; }
    sql += ` ORDER BY created_at DESC`;
    if (limit) { sql += ` LIMIT $${idx++}`; params.push(parseInt(limit, 10)); }

    const videos = await query(sql, params);
    return ok(videos);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, description, video_url, thumbnail_url, category, status } = body;

    if (!title || !video_url) return err('Title and video URL are required');

    const video = await queryOne(
      `INSERT INTO videos (title, description, video_url, thumbnail_url, category, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description || null, video_url, thumbnail_url || null, category || null, status || 'published', user.id]
    );

    await writeAuditLog(user.id, 'CREATE_VIDEO', 'videos', (video as { id: string }).id, { title });
    return ok(video, 201);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
