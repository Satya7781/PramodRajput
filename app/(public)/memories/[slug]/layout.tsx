import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { contentMetadata } from '@/lib/seo';

interface MemoryRecord {
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  location: string | null;
}

async function getMemory(slug: string): Promise<MemoryRecord | null> {
  return queryOne<MemoryRecord>(
    `SELECT title, slug, description, cover_image_url, event_date, location
     FROM event_memories WHERE slug = $1 AND status = 'published'`,
    [slug]
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const memory = await getMemory(params.slug);
  if (!memory) return {};

  return contentMetadata({
    title: memory.title,
    description: memory.description || (memory.location ? `Community memory from ${memory.location}.` : null),
    image: memory.cover_image_url,
    path: `/memories/${memory.slug}`,
    publishedTime: memory.event_date,
  });
}

export default async function MemoryDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}): Promise<JSX.Element> {
  if (!await getMemory(params.slug)) notFound();
  return <>{children}</>;
}
