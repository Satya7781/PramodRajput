import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { contentMetadata } from '@/lib/seo';

interface EventRecord {
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  banner_url?: string | null;
  cover_image_url?: string | null;
  start_date: string | null;
  venue: string | null;
  status: string;
}

interface GalleryEventRecord {
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  year: number;
}

async function getContent(slug: string): Promise<{ title: string; description: string | null; image: string | null; path: string; publishedTime?: string | null } | null> {
  const event = await queryOne<EventRecord>(
    `SELECT title, slug, short_description, description, banner_url, start_date, venue, status
     FROM events
     WHERE slug = $1 AND status IN ('published', 'registration_open', 'registration_closed', 'completed')`,
    [slug]
  );

  if (event) {
    return {
      title: event.title,
      description: event.short_description || event.description || (event.venue ? `Event at ${event.venue}.` : null),
      image: event.banner_url || event.cover_image_url || null,
      path: `/events/${event.slug}`,
      publishedTime: event.start_date,
    };
  }

  const galleryEvent = await queryOne<GalleryEventRecord>(
    `SELECT name, slug, description, cover_url, year FROM gallery_events WHERE slug = $1`,
    [slug]
  );

  if (!galleryEvent) return null;
  return {
    title: galleryEvent.name,
    description: galleryEvent.description || `Photos and videos from ${galleryEvent.year}.`,
    image: galleryEvent.cover_url,
    path: `/events/${galleryEvent.slug}`,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const content = await getContent(params.slug);
  if (!content) return {};

  return contentMetadata({
    title: content.title,
    description: content.description,
    image: content.image,
    path: content.path,
    publishedTime: content.publishedTime,
  });
}

export default async function EventDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}): Promise<JSX.Element> {
  if (!await getContent(params.slug)) notFound();
  return <>{children}</>;
}
