import type { Metadata } from 'next';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Pramod Rajput';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
export const SITE_URL = configuredSiteUrl?.startsWith('https://')
  ? configuredSiteUrl.replace(/\/$/, '')
  : 'https://www.npramodrajput.co.in';

export const DEFAULT_OG_IMAGE = process.env.NEXT_PUBLIC_OG_IMAGE?.startsWith('https://')
  ? process.env.NEXT_PUBLIC_OG_IMAGE
  : `${SITE_URL}/og-image.png?v=2`;

export function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('https://')) return pathOrUrl;
  return `${SITE_URL}/${pathOrUrl.replace(/^\/+/, '')}`;
}

export function contentImageUrl(imageUrl: string | null | undefined): string {
  return absoluteUrl(imageUrl || DEFAULT_OG_IMAGE);
}

function cleanDescription(description: string | null | undefined): string {
  return (description || `Official digital platform of ${SITE_NAME} — public servant, community leader, and advocate for grassroots development.`)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

export function contentMetadata({
  title,
  description,
  image,
  path,
  type = 'article',
  publishedTime,
}: {
  title: string;
  description?: string | null;
  image?: string | null;
  path: string;
  type?: 'article' | 'website';
  publishedTime?: string | null;
}): Metadata {
  const descriptionText = cleanDescription(description);
  const imageUrl = contentImageUrl(image);
  const pageUrl = absoluteUrl(path);

  return {
    title,
    description: descriptionText,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description: descriptionText,
      url: pageUrl,
      siteName: SITE_NAME,
      type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: descriptionText,
      images: [{ url: imageUrl, alt: title }],
    },
  };
}
