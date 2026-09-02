import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/memories/slug/[slug] — public
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const memory = await queryOne(
      `SELECT * FROM event_memories WHERE slug = $1 AND status = 'published'`,
      [params.slug]
    );
    if (!memory) return err('Memory not found', 404);

    const [photos, videos] = await Promise.all([
      query(`SELECT * FROM memory_photos WHERE memory_id=$1 ORDER BY sort_order`, [(memory as { id: string }).id]),
      query(`SELECT * FROM memory_videos WHERE memory_id=$1 ORDER BY sort_order`, [(memory as { id: string }).id]),
    ]);

    return ok({ ...memory, memory_photos: photos, memory_videos: videos });
  } catch (e) {
    console.error('GET /api/memories/slug/[slug] error:', e);
    return err('Internal server error', 500);
  }
}
