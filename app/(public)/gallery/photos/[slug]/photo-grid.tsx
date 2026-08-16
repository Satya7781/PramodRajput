'use client';

import { useState } from 'react';
import type { Photo } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox((prev) => (prev === null ? null : (prev - 1 + photos.length) % photos.length));
  const next = () => setLightbox((prev) => (prev === null ? null : (prev + 1) % photos.length));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(i)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-muted hover:shadow-lg transition-all animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || ''}
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {photo.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-xs text-left">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <div className="max-w-5xl max-h-[85vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightbox].image_url}
              alt={photos[lightbox].caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {photos[lightbox].caption && (
              <p className="text-white/80 text-center mt-4 text-sm">{photos[lightbox].caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
