'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { MemoryPhoto } from '@/lib/types';

interface Props {
  photos: MemoryPhoto[];
}

export function MemoryPhotoGrid({ photos }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const open  = (i: number) => setLightbox(i);
  const close = () => setLightbox(null);
  const prev  = () => setLightbox(i => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  const next  = () => setLightbox(i => (i !== null ? (i + 1) % photos.length : null));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => open(i)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <img
              src={photo.image_url}
              alt={photo.caption ?? `Photo ${i + 1}`}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
            {/* Caption */}
            {photo.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
          onClick={close}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-10">
            {lightbox + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-3 sm:left-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors text-white z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[88vh] max-w-[90vw] flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[lightbox].image_url}
              alt={photos[lightbox].caption ?? `Photo ${lightbox + 1}`}
              className="max-h-[88vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            {photos[lightbox].caption && (
              <div className="absolute bottom-0 inset-x-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                <p className="text-white text-sm text-center">{photos[lightbox].caption}</p>
              </div>
            )}
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-3 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors text-white z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Thumbnail strip (shows when > 1 photo) */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={e => { e.stopPropagation(); setLightbox(i); }}
                  className={`shrink-0 h-10 w-10 rounded overflow-hidden border-2 transition-all ${
                    i === lightbox ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                >
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
