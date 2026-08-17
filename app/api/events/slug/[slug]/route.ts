import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

// GET /api/events/slug/[slug] — public
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const event = await queryOne(`SELECT * FROM events WHERE slug = $1`, [params.slug]);
    if (!event) return err('Event not found', 404);
    return ok(event);
  } catch (e) {
    console.error('GET /api/events/slug/[slug] error:', e);
    return err('Internal server error', 500);
  }
}
