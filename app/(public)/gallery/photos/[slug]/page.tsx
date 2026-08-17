import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import type { PhotoAlbum, Photo } from '@/lib/types';
import { PhotoGrid } from './photo-grid';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getAlbumWithPhotos(slug: string): Promise<{ album: PhotoAlbum; photos: Photo[] } | null> {
  try {
    const res = await fetch(`${BASE}/api/albums/slug/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getAlbumWithPhotos(params.slug);
  if (!data) return { title: 'Album Not Found' };
  return { title: `${data.album.title} — Pramod Rajput`, description: data.album.description || data.album.title };
}

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const data = await getAlbumWithPhotos(params.slug);
  if (!data) notFound();

  const { album, photos } = data;

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            href="/gallery/photos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Albums
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">{album.title}</h1>
          {album.description && <p className="text-muted-foreground max-w-2xl">{album.description}</p>}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {photos.length > 0 ? (
            <PhotoGrid photos={photos} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No photos in this album yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
