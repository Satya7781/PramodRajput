import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

// DELETE /api/news/categories/[id] — admin only (categories linked to news can't be deleted)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;

  try {
    const category = await queryOne(
      `DELETE FROM news_categories WHERE id=$1 RETURNING id`,
      [params.id]
    );
    if (!category) return err('Category not found', 404);
    return ok({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    // FK violation — news articles still use this category
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return err('Cannot delete category — news articles are still assigned to it', 409);
    }
    return err(msg, 500);
  }
}

// PUT /api/news/categories/[id] — editor+: rename a category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const { name, slug } = body as { name?: string; slug?: string };

    if (!name?.trim()) return err('Name is required');
    if (!slug?.trim()) return err('Slug is required');

    const category = await queryOne(
      `UPDATE news_categories SET name=$1, slug=$2 WHERE id=$3 RETURNING *`,
      [name.trim(), slug.trim(), params.id]
    );

    if (!category) return err('Category not found', 404);
    return ok(category);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}
