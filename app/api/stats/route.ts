import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;

  try {
    const [
      total_events, active_events, total_registrations, pending_registrations,
      certificates_generated, news_articles, photo_albums, videos,
    ] = await Promise.all([
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM events`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM events WHERE status IN ('published','registration_open')`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM registrations`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM registrations WHERE status='pending'`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM certificates`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM news`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM photo_albums`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM videos`),
    ]);

    return ok({
      totalEvents: parseInt(total_events?.count ?? '0', 10),
      activeEvents: parseInt(active_events?.count ?? '0', 10),
      totalRegistrations: parseInt(total_registrations?.count ?? '0', 10),
      pendingRegistrations: parseInt(pending_registrations?.count ?? '0', 10),
      certificatesGenerated: parseInt(certificates_generated?.count ?? '0', 10),
      newsArticles: parseInt(news_articles?.count ?? '0', 10),
      photoAlbums: parseInt(photo_albums?.count ?? '0', 10),
      videos: parseInt(videos?.count ?? '0', 10),
    });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
