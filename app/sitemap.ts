import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

const publicPaths = ['/', '/about', '/journey', '/achievements', '/events', '/news', '/memories', '/gallery/photos', '/gallery/videos', '/contact', '/certificate/verify'];

interface SlugRecord {
  slug: string;
  updated_at?: string;
}

async function publishedSlugs(sql: string): Promise<SlugRecord[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await query<SlugRecord>(sql);
  } catch (error) {
    console.error('Sitemap dynamic content query failed:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news, memories] = await Promise.all([
    publishedSlugs(`SELECT slug, updated_at FROM events WHERE status IN ('published', 'registration_open', 'registration_closed', 'completed')`),
    publishedSlugs(`SELECT slug, updated_at FROM news WHERE status = 'published'`),
    publishedSlugs(`SELECT slug, updated_at FROM event_memories WHERE status = 'published'`),
  ]);

  const urls: MetadataRoute.Sitemap = [];
  for (const locale of ['hi', 'en'] as const) {
    urls.push(...publicPaths.map(path => ({
      url: `${SITE_URL}/${locale}${path === '/' ? '/' : path}`,
      alternates: {
        languages: {
          hi: `${SITE_URL}/hi${path === '/' ? '/' : path}`,
          en: `${SITE_URL}/en${path === '/' ? '/' : path}`,
        },
      },
    })));
    for (const [records, path] of [[events, '/events'], [news, '/news'], [memories, '/memories']] as const) {
      urls.push(...records.map(record => ({
        url: `${SITE_URL}/${locale}${path}/${encodeURIComponent(record.slug)}`,
        lastModified: record.updated_at ? new Date(record.updated_at) : undefined,
        alternates: {
          languages: {
            hi: `${SITE_URL}/hi${path}/${encodeURIComponent(record.slug)}`,
            en: `${SITE_URL}/en${path}/${encodeURIComponent(record.slug)}`,
          },
        },
      })));
    }
  }
  return urls;
}
