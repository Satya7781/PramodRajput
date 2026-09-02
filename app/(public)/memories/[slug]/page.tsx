'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft, Camera, Video as VideoIcon, BookOpen, Play, ExternalLink, Loader2 } from 'lucide-react';
import type { EventMemory, MemoryPhoto, MemoryVideo } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import { MemoryPhotoGrid } from './memory-photo-grid';

interface FullMemory extends EventMemory {
  memory_photos: MemoryPhoto[];
  memory_videos: MemoryVideo[];
}

function getYouTubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function MemoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [memory, setMemory] = useState<FullMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/memories/slug/${encodeURIComponent(params.slug)}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then(data => { if (data) setMemory(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params?.slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFound || !memory) return (
    <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('memories','notFound')}</h1>
        <Link href="/memories" className="text-primary underline text-sm">{t('memories','allMemories')}</Link>
      </div>
    </div>
  );

  // bilingual fields
  const title       = (lang === 'en' && (memory as any).title_en)       ? (memory as any).title_en       : memory.title;
  const description = (lang === 'en' && (memory as any).description_en) ? (memory as any).description_en : memory.description;

  const photos = memory.memory_photos ?? [];
  const videos = memory.memory_videos ?? [];
  const embedVideos = videos.map(v => ({ ...v, embedUrl: getYouTubeEmbedUrl(v.video_url) }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[280px] sm:h-[420px] overflow-hidden">
        <div className="absolute inset-0">
          {memory.cover_image_url
            ? <img src={memory.cover_image_url} alt={title} className="h-full w-full object-cover" />
            : <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex flex-col justify-end pb-8 sm:pb-10">
          <div className="max-w-3xl animate-slide-up">
            <Link href="/memories" className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors mb-3 sm:mb-4">
              <ArrowLeft className="h-4 w-4" /> {t('memories','allMemories')}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {memory.event_date && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" />{formatDate(memory.event_date, lang)}
                </span>
              )}
              {memory.location && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <MapPin className="h-3.5 w-3.5" />{memory.location}
                </span>
              )}
              {photos.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <Camera className="h-3.5 w-3.5" />{photos.length} {t('memories','photosFrom')}
                </span>
              )}
              {videos.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1 font-medium">
                  <VideoIcon className="h-3.5 w-3.5" />{videos.length} {t('memories','videosFrom')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-balance leading-tight">{title}</h1>
          </div>
        </div>
      </section>

      {/* Description */}
      {description && (
        <section className="py-10 sm:py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold">{t('memories','aboutEvent')}</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <section className="py-12 sm:py-14">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{t('memories','photoGallery')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{photos.length} {t('memories','photosFrom')}</p>
              </div>
            </div>
            <MemoryPhotoGrid photos={photos} />
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="py-12 sm:py-14 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <VideoIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{t('memories','videoSection')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{videos.length} {t('memories','videosFrom')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {embedVideos.map(video => (
                <div key={video.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  {video.embedUrl ? (
                    <div className="aspect-video">
                      <iframe src={video.embedUrl} title={video.title ?? 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" loading="lazy" />
                    </div>
                  ) : (
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="group relative aspect-video flex items-center justify-center bg-muted block">
                      {video.thumbnail_url && <img src={video.thumbnail_url} alt={video.title ?? ''} className="h-full w-full object-cover" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <Play className="h-6 w-6 sm:h-7 sm:w-7 text-primary fill-primary ml-1" />
                        </div>
                      </div>
                    </a>
                  )}
                  {video.title && (
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-medium line-clamp-1">{video.title}</p>
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary transition-colors" title={t('memories','openOriginal')}>
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

      <section className="py-8 sm:py-10 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <Link href="/memories" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('memories','backToAll')}
          </Link>
        </div>
      </section>
    </div>
  );
}
