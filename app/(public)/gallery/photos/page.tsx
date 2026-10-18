'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ImageIcon, ArrowRight } from 'lucide-react';
import type { PhotoAlbum } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

export default function PhotosPage() {
  const { t } = useLanguage();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/albums').then(r => r.ok ? r.json() : []).then(d => { setAlbums(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('gallery', 'photosTag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('gallery', 'photosTitle')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('gallery', 'photosDesc')}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-56 animate-pulse" />)}
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {albums.map((album, i) => (
                <Link key={album.id} href={`/gallery/photos/${album.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    {album.cover_image_url
                      ? <img src={album.cover_image_url} alt={album.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      : <div className="h-full w-full flex items-center justify-center bg-muted"><ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-sm font-medium flex items-center gap-1">{t('common', 'viewPhotos')} <ArrowRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">{album.title}</h3>
                    {album.description && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{album.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm">{t('gallery', 'noAlbums')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
