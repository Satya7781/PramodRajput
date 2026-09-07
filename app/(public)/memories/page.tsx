'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Camera, Video, ArrowRight, BookOpen } from 'lucide-react';
import type { EventMemory } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

function MemorySkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function MemoriesPage() {
  const { lang, t } = useLanguage();
  const [memories, setMemories] = useState<EventMemory[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/memories')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setMemories(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
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
      <section className="py-14 sm:py-20 bg-gradient-to-br from-secondary/8 via-background to-primary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs sm:text-sm font-bold text-primary mb-4">
              <BookOpen className="h-3.5 w-3.5" />{t('memories', 'tag')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-1 mb-4 text-balance leading-tight">
              {t('memories', 'title')}
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('memories', 'desc')}</p>
            {memories.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-5">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  <span className="text-primary font-black text-base sm:text-lg">{memories.length}</span>{' '}
                  {t('memories', 'documented')}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  <span className="text-primary font-black text-base sm:text-lg">{years.length}</span>{' '}
                  {t('memories', 'years')}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="space-y-14">
              {[1, 2].map(y => (
                <div key={y}>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mb-7" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {[1,2,3].map(i => <MemorySkeleton key={i} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted mb-5">
                <BookOpen className="h-9 w-9 text-muted-foreground/40" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">{t('memories', 'noMemories')}</h2>
              <p className="text-sm text-muted-foreground max-w-xs">{t('memories', 'checkBack')}</p>
            </div>
          ) : (
            <div className="space-y-14 sm:space-y-20">
              {years.map(year => (
                <div key={year} className="animate-slide-up">
                  {/* Year divider */}
                  <div className="flex items-center gap-4 mb-7 sm:mb-8">
                    <span className="text-4xl sm:text-5xl font-black text-primary/15 select-none leading-none tabular-nums">
                      {year}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground shrink-0 bg-muted px-3 py-1 rounded-full">
                      {byYear[year].length}{' '}
                      {byYear[year].length === 1 ? t('memories', 'events_s') : t('memories', 'events_p')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {byYear[year].map((memory, i) => (
                      <Link
                        key={memory.id}
                        href={`/memories/${memory.slug}`}
                        className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        {/* Cover */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          {memory.cover_image_url
                            ? <img
                                src={memory.cover_image_url}
                                alt={memory.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            : <div className="h-full w-full flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                              </div>}

                          {/* Media count badges */}
                          {((memory.photo_count ?? 0) > 0 || (memory.video_count ?? 0) > 0) && (
                            <div className="absolute bottom-2.5 right-2.5 flex gap-1.5">
                              {(memory.photo_count ?? 0) > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-xs px-2 py-0.5 font-medium">
                                  <Camera className="h-3 w-3" />{memory.photo_count}
                                </span>
                              )}
                              {(memory.video_count ?? 0) > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-xs px-2 py-0.5 font-medium">
                                  <Video className="h-3 w-3" />{memory.video_count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-4 sm:p-5">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                            {memory.event_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{formatDate(memory.event_date, lang)}
                              </span>
                            )}
                            {memory.location && (
                              <span className="flex items-center gap-1 truncate max-w-[140px]">
                                <MapPin className="h-3 w-3 shrink-0" />{memory.location}
                              </span>
                            )}
                          </div>
                          <h2 className="font-bold text-sm sm:text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {memory.title}
                          </h2>
                          {memory.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                              {memory.description}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
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
