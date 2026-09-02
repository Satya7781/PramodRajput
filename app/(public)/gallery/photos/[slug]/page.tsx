'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, Loader2 } from 'lucide-react';
import type { PhotoAlbum, Photo } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { PhotoGrid } from './photo-grid';

export default function AlbumPage() {
  const params = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const [album, setAlbum] = useState<PhotoAlbum | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/albums/slug/${encodeURIComponent(params.slug)}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then((data: { album: PhotoAlbum; photos: Photo[] } | null) => {
        if (data) { setAlbum(data.album); setPhotos(data.photos); }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params?.slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFound || !album) return (
    <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
      <div>
        <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
        <h1 className="text-xl font-bold mb-2">{t('gallery','albumNotFound')}</h1>
        <Link href="/gallery/photos" className="text-primary underline text-sm">{t('gallery','backToAlbums')}</Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <section className="py-12 sm:py-16 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <Link href="/gallery/photos" className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 sm:mb-6">
            <ArrowLeft className="h-4 w-4" /> {t('gallery','backToAlbums')}
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-balance">{album.title}</h1>
          {album.description && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">{album.description}</p>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {photos.length} {t('gallery','photosIn')}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 lg:px-8">
          {photos.length > 0 ? (
            <PhotoGrid photos={photos} />
          ) : (
            <div className="text-center py-14 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm">{t('gallery','noPhotosYet')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
