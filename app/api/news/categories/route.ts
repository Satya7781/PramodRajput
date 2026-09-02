import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/news/categories — public
export async function GET(_req: NextRequest) {
  try {
    const categories = await query(`SELECT * FROM news_categories ORDER BY name`);
    return ok(categories);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// POST /api/news/categories — editor+: create a category
export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const { name, slug } = body as { name?: string; slug?: string };

    if (!name?.trim()) return err('Name is required');
    if (!slug?.trim()) return err('Slug is required');

    const category = await queryOne(
      `INSERT INTO news_categories (name, slug) VALUES ($1, $2) RETURNING *`,
      [name.trim(), slug.trim()]
    );

    return ok(category, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    return err(msg, 500);
  }
}
