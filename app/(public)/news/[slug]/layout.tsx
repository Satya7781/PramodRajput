import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { contentMetadata } from '@/lib/seo';

interface NewsRecord {
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  status: string;
}

async function getArticle(slug: string): Promise<NewsRecord | null> {
  return queryOne<NewsRecord>(
    `SELECT title, slug, excerpt, featured_image_url, published_at, status
     FROM news WHERE slug = $1 AND status = 'published'`,
    [slug]
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return {};

  return contentMetadata({
    title: article.title,
    description: article.excerpt,
    image: article.featured_image_url,
    path: `/news/${article.slug}`,
    publishedTime: article.published_at,
  });
}

export default async function NewsArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}): Promise<JSX.Element> {
  if (!await getArticle(params.slug)) notFound();
  return <>{children}</>;
}
