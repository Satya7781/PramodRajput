'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Camera, Video, ArrowRight, BookOpen } from 'lucide-react';
import type { EventMemory } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

export default function MemoriesPage() {
  const { lang, t } = useLanguage();
  const [memories, setMemories] = useState<EventMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memories').then(r => r.ok ? r.json() : []).then(d => { setMemories(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const byYear: Record<string, EventMemory[]> = {};
  for (const m of memories) {
    const year = m.event_date ? new Date(m.event_date).getFullYear().toString() : '—';
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(m);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-4">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{t('memories', 'tag')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance leading-tight">{t('memories', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('memories', 'desc')}</p>
            {memories.length > 0 && (
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                {memories.length} {t('memories', 'documented')} · {years.length} {t('memories', 'years')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-64 animate-pulse" />)}
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('memories', 'noMemories')}</h2>
              <p className="text-sm text-muted-foreground">{t('memories', 'checkBack')}</p>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {years.map(year => (
                <div key={year}>
                  {/* Year heading */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-4xl font-black text-primary/20 select-none leading-none">{year}</span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs sm:text-sm text-muted-foreground shrink-0">{byYear[year].length} {byYear[year].length === 1 ? t('memories', 'events_s') : t('memories', 'events_p')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {byYear[year].map((memory, i) => (
                      <Link key={memory.id} href={`/memories/${memory.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                        {/* Cover */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          {memory.cover_image_url
                            ? <img src={memory.cover_image_url} alt={memory.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            : <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-12 w-12 text-muted-foreground opacity-20" /></div>}
                          {/* Media count badges */}
                          {((memory.photo_count ?? 0) > 0 || (memory.video_count ?? 0) > 0) && (
                            <div className="absolute bottom-2 right-2 flex gap-1.5">
                              {(memory.photo_count ?? 0) > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5">
                                  <Camera className="h-3 w-3" />{memory.photo_count}
                                </span>
                              )}
                              {(memory.video_count ?? 0) > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5">
                                  <Video className="h-3 w-3" />{memory.video_count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-4 sm:p-5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                            {memory.event_date && (
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(memory.event_date, lang)}</span>
                            )}
                            {memory.location && (
                              <span className="flex items-center gap-1 truncate max-w-[130px]"><MapPin className="h-3 w-3 shrink-0" />{memory.location}</span>
                            )}
                          </div>
                          <h2 className="font-bold text-sm sm:text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{memory.title}</h2>
                          {memory.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">{memory.description}</p>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                            {t('common', 'viewMemory')} <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
