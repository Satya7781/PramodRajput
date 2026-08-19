import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/memories/[id]/videos
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const videos = await query(
      `SELECT * FROM memory_videos WHERE memory_id=$1 ORDER BY sort_order`,
      [params.id]
    );
    return ok(videos);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

// POST /api/memories/[id]/videos — add a video
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const { video_url, title, thumbnail_url } = body as {
      video_url: string; title?: string; thumbnail_url?: string;
    };

    if (!video_url?.trim()) return err('video_url is required');

    // Auto-detect YouTube thumbnail if not provided
    const ytMatch = video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const thumb = thumbnail_url?.trim() || (ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : null);

    const maxRow = await queryOne<{ max: number | null }>(
      `SELECT MAX(sort_order) as max FROM memory_videos WHERE memory_id=$1`, [params.id]
    );
    const sort_order = (maxRow?.max ?? -1) + 1;

    const video = await queryOne(
      `INSERT INTO memory_videos (memory_id, video_url, title, thumbnail_url, sort_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [params.id, video_url.trim(), title?.trim() || null, thumb, sort_order]
    );
    return ok(video, 201);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
