import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const categories = await query(`SELECT * FROM news_categories ORDER BY name`);
    return ok(categories);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
