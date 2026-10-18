'use client';

import type { Video } from '@/lib/types';
import { Play } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {videos.map((video) => {
        const embedUrl = getEmbedUrl(video.video_url);
        return (
          <div key={video.id} className="rounded-2xl border border-border bg-card overflow-hidden group">
            {embedUrl ? (
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : video.thumbnail_url ? (
              <div className="relative aspect-video bg-muted">
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black">
                    <Play className="h-6 w-6 ml-1" />
                  </span>
                </a>
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Play className="h-8 w-8" />
                  <span className="text-xs">Watch Video</span>
                </a>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
              {video.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
