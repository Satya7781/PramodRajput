import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar, MapPin, ArrowLeft, Camera, Video as VideoIcon,
  BookOpen, Play, ExternalLink,
} from 'lucide-react';
import type { EventMemory, MemoryPhoto, MemoryVideo } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { MemoryPhotoGrid } from './memory-photo-grid';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface FullMemory extends EventMemory {
  memory_photos: MemoryPhoto[];
  memory_videos: MemoryVideo[];
}

async function getMemory(slug: string): Promise<FullMemory | null> {
  try {
    const res = await fetch(
      `${BASE}/api/memories/slug/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const memory = await getMemory(params.slug);
  if (!memory) return { title: 'Memory Not Found' };
  return {
    title: `${memory.title} — Pramod Rajput`,
    description: memory.description
      ? memory.description.slice(0, 155)
      : `Memories from ${formatDate(memory.event_date)}`,
    openGraph: memory.cover_image_url
      ? { images: [{ url: memory.cover_image_url }] }
      : undefined,
  };
}

// ─── YouTube embed helper ─────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function MemoryDetailPage({ params }: { params: { slug: string } }) {
  const memory = await getMemory(params.slug);
  if (!memory) notFound();

  const photos = memory.memory_photos ?? [];
  const videos = memory.memory_videos ?? [];
  const embedVideos = videos.map(v => ({ ...v, embedUrl: getYouTubeEmbedUrl(v.video_url) }));

  return (
    <div className="flex flex-col">

      {/* ── Hero Banner ── */}
      <section className="relative h-[420px] overflow-hidden">
        <div className="absolute inset-0">
          {memory.cover_image_url ? (
            <img
              src={memory.cover_image_url}
              alt={memory.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex flex-col justify-end pb-10">
          <div className="max-w-3xl animate-slide-up">
            <Link
              href="/memories"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> All Memories
            </Link>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {memory.event_date && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(memory.event_date)}
                </span>
              )}
              {memory.location && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  {memory.location}
                </span>
              )}
              {photos.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <Camera className="h-3.5 w-3.5" />
                  {photos.length} photo{photos.length !== 1 ? 's' : ''}
                </span>
              )}
              {videos.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <VideoIcon className="h-3.5 w-3.5" />
                  {videos.length} video{videos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-white text-balance leading-tight">
              {memory.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Description ── */}
      {memory.description && (
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-5">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-xl font-bold">About This Event</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                {memory.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Photos ── */}
      {photos.length > 0 && (
        <section className="py-14">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Photo Gallery</h2>
                <p className="text-sm text-muted-foreground">{photos.length} photos from the event</p>
              </div>
            </div>
            <MemoryPhotoGrid photos={photos} />
          </div>
        </section>
      )}

      {/* ── Videos ── */}
      {videos.length > 0 && (
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <VideoIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Videos</h2>
                <p className="text-sm text-muted-foreground">{videos.length} video{videos.length !== 1 ? 's' : ''} from the event</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {embedVideos.map(video => (
                <div key={video.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  {video.embedUrl ? (
                    /* YouTube embed */
                    <div className="aspect-video">
                      <iframe
                        src={video.embedUrl}
                        title={video.title ?? 'Video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    /* Non-YouTube: thumbnail + link */
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video flex items-center justify-center bg-muted block"
                    >
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title ?? ''}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <Play className="h-7 w-7 text-primary fill-primary ml-1" />
                        </div>
                      </div>
                    </a>
                  )}

                  {video.title && (
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        title="Open original"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Back link ── */}
      <section className="py-10 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            href="/memories"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to All Memories
          </Link>
        </div>
      </section>
    </div>
  );
}
