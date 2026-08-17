import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const article = await queryOne(
      `SELECT n.*, row_to_json(nc) as news_categories
       FROM news n
       LEFT JOIN news_categories nc ON nc.id = n.category_id
       WHERE n.id=$1`,
      [params.id]
    );
    if (!article) return err('Article not found', 404);
    return ok(article);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, featured_image_url, category_id, status } = body;

    // Get current article to check if status changed to published
    const current = await queryOne<{ status: string; published_at: string | null }>(
      `SELECT status, published_at FROM news WHERE id=$1`, [params.id]
    );

    const publishedAt = status === 'published' && current?.status !== 'published'
      ? new Date().toISOString()
      : (status === 'published' ? current?.published_at : null);

    const article = await queryOne(
      `UPDATE news SET
         title=$1, slug=$2, excerpt=$3, content=$4, featured_image_url=$5,
         category_id=$6, status=$7, published_at=$8, updated_at=now()
       WHERE id=$9 RETURNING *`,
      [title, slug, excerpt || null, content || null, featured_image_url || null,
       category_id || null, status || 'draft', publishedAt || null, params.id]
    );

    if (!article) return err('Article not found', 404);
    await writeAuditLog(user.id, 'UPDATE_NEWS', 'news', params.id, { title });
    return ok(article);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const article = await queryOne(`DELETE FROM news WHERE id=$1 RETURNING id`, [params.id]);
    if (!article) return err('Article not found', 404);
    await writeAuditLog(user.id, 'DELETE_NEWS', 'news', params.id, {});
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
