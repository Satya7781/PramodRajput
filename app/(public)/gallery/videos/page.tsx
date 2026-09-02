'use client';

import { useEffect, useState } from 'react';
import { Video as VideoIcon } from 'lucide-react';
import type { Video } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { VideoGrid } from './video-grid';

export default function VideosPage() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/videos').then(r => r.ok ? r.json() : []).then(d => { setVideos(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('gallery', 'videosTag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('gallery', 'videosTitle')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('gallery', 'videosDesc')}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-48 animate-pulse" />)}
            </div>
          ) : videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm">{t('gallery', 'noVideos')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
