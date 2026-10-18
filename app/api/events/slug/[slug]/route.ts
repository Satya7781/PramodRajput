import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

// GET /api/events/slug/[slug] — public
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Decode the slug — Next.js may pass it single-encoded; decodeURIComponent handles that.
    // If somehow double-encoded, decode twice.
    let slug = params.slug;
    try { slug = decodeURIComponent(slug); } catch { /* leave as-is */ }
    // Attempt a second decode if it still contains %
    if (slug.includes('%')) {
      try { slug = decodeURIComponent(slug); } catch { /* leave as-is */ }
    }

    const event = await queryOne(`SELECT * FROM events WHERE slug = $1`, [slug]);
    if (!event) return err('Event not found', 404);
    return ok(event);
  } catch (e) {
    console.error('GET /api/events/slug/[slug] error:', e);
    return err('Internal server error', 500);
  }
}
