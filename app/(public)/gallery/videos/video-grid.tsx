'use client';

import { useState } from 'react';
import type { Video } from '@/lib/types';
import { X, Play } from 'lucide-react';

export function VideoGrid({ videos }: { videos: Video[] }) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const getEmbedUrl = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    return url;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, i) => (
          <button
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all text-left animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="aspect-video overflow-hidden bg-muted relative">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-secondary fill-secondary ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-5">
              {video.category && (
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{video.category}</span>
              )}
              <h3 className="font-bold mt-1.5 mb-1.5 group-hover:text-primary transition-colors">{video.title}</h3>
              {video.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setActiveVideo(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getEmbedUrl(activeVideo.video_url)}
                title={activeVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-white font-bold mt-4 text-lg">{activeVideo.title}</h3>
            {activeVideo.description && (
              <p className="text-white/70 text-sm mt-1">{activeVideo.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
