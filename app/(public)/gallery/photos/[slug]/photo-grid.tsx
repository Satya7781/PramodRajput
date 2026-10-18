'use client';

import { useState } from 'react';
import type { Photo } from '@/lib/types';
import { X } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative"
            onClick={() => setLightbox(photo)}
          >
            <img
              src={photo.image_url}
              alt={photo.caption ?? ''}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox.image_url}
            alt={lightbox.caption ?? ''}
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.caption && (
            <p className="absolute bottom-6 left-0 right-0 text-center text-white/80 text-sm px-8">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
