import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const album = await queryOne(
      `SELECT * FROM photo_albums WHERE slug=$1 AND status='published'`,
      [params.slug]
    );
    if (!album) return err('Album not found', 404);

    const photos = await query(
      `SELECT * FROM photos WHERE album_id=$1 ORDER BY sort_order`,
      [(album as { id: string }).id]
    );

    return ok({ album, photos });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
