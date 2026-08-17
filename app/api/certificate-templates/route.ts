import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const templates = await query(
      `SELECT id, name FROM certificate_templates WHERE is_active=true ORDER BY name`
    );
    return ok(templates);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
