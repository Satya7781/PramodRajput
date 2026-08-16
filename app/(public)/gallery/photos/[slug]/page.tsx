import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { PhotoAlbum, Photo } from '@/lib/types';
import { PhotoGrid } from './photo-grid';

async function getAlbum(slug: string) {
  const { data } = await supabase
    .from('photo_albums')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return data as PhotoAlbum | null;
}

async function getPhotos(albumId: string) {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true });
  return (data || []) as Photo[];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const album = await getAlbum(params.slug);
  if (!album) return { title: 'Album Not Found' };
  return {
    title: `${album.title} — Pramod Rajput`,
    description: album.description || album.title,
  };
}

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const album = await getAlbum(params.slug);
  if (!album) notFound();

  const photos = await getPhotos(album.id);

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
