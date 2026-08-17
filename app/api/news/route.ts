import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/news — public & admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === '1';
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : null;

    let sql = `
      SELECT n.*, row_to_json(nc) as news_categories
      FROM news n
      LEFT JOIN news_categories nc ON nc.id = n.category_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (slug) {
      sql += ` AND n.slug=$${idx++}`;
      params.push(slug);
    }

    if (!adminMode) {
      sql += ` AND n.status='published'`;
    } else if (status) {
      sql += ` AND n.status=$${idx++}`;
      params.push(status);
    }

    if (categoryId) {
      sql += ` AND n.category_id=$${idx++}`;
      params.push(categoryId);
    }

    sql += ` ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC`;
    if (limit) { sql += ` LIMIT $${idx++}`; params.push(limit); }

    const articles = await query(sql, params);
    return ok(articles);
  } catch (e) {
    console.error('GET /api/news error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/news — editor or admin
export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, featured_image_url, category_id, status } = body;

    if (!title || !slug) return err('Title and slug are required');

    const article = await queryOne(
      `INSERT INTO news (title, slug, excerpt, content, featured_image_url, category_id, status, published_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        title, slug, excerpt || null, content || null,
        featured_image_url || null, category_id || null, status || 'draft',
        status === 'published' ? new Date().toISOString() : null,
        user.id,
      ]
    );

    await writeAuditLog(user.id, 'CREATE_NEWS', 'news', (article as { id: string }).id, { title });
    return ok(article, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}
