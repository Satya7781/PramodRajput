'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Calendar, ImageIcon, Video, FolderOpen } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface YearSummary {
  year: number;
  event_count: string;
  photo_count: string;
  video_count: string;
}

interface GalleryEvent {
  id: string;
  year: number;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  photo_count: string;
  video_count: string;
}

const ALL_YEARS = Array.from({ length: 2026 - 2009 + 1 }, (_, i) => 2026 - i);

export default function EventsPage() {
  const { lang, t } = useLanguage();

  const [yearSummaries, setYearSummaries] = useState<YearSummary[]>([]);
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [yearEvents, setYearEvents] = useState<Record<number, GalleryEvent[]>>({});
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/gallery-events')
      .then(r => r.ok ? r.json() : [])
      .then((data: YearSummary[]) => { setYearSummaries(data); setLoadingYears(false); })
      .catch(() => setLoadingYears(false));
  }, []);

  const hasData = (year: number) => yearSummaries.some(y => y.year === year);
  const getSummary = (year: number) => yearSummaries.find(y => y.year === year);

  const toggleYear = async (year: number) => {
    if (openYear === year) { setOpenYear(null); return; }
    setOpenYear(year);
    if (yearEvents[year]) return;
    setLoadingEvents(year);
    try {
      const data: GalleryEvent[] = await fetch(`/api/gallery-events?year=${year}`).then(r => r.json()).then(d => Array.isArray(d) ? d : []);
      setYearEvents(prev => ({ ...prev, [year]: data }));
    } finally {
      setLoadingEvents(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              {t('events', 'tag')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 text-balance">
              {t('events', 'title')}
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
              {lang === 'hi'
                ? '2009 से अब तक के सभी प्रमुख कार्यक्रमों की फ़ोटो और वीडियो।'
                : 'Photos and videos from all major events and programmes since 2009.'}
            </p>
          </div>
        </div>
      </section>

      {/* Year list */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {loadingYears ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {ALL_YEARS.map(year => {
                const summary = getSummary(year);
                const isOpen = openYear === year;
                const events = Array.isArray(yearEvents[year]) ? yearEvents[year] : [];
                const isLoading = loadingEvents === year;

                return (
                  <div
                    key={year}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden
                      ${isOpen ? 'border-primary/40 shadow-md' : 'border-border hover:border-primary/20'}`}
                  >
                    {/* Year row */}
                    <button
                      onClick={() => toggleYear(year)}
                      className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors cursor-pointer
                        ${isOpen ? 'bg-primary/5' : 'bg-card hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${isOpen ? 'text-primary' : ''}`}>
                          {year}
                        </span>
                        {summary ? (
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                              <FolderOpen className="h-3 w-3" />
                              {summary.event_count} {lang === 'hi' ? 'कार्यक्रम' : 'events'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                              <ImageIcon className="h-3 w-3" />{summary.photo_count}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                              <Video className="h-3 w-3" />{summary.video_count}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      {isOpen
                        ? <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                        : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                    </button>

                    {/* Expanded events */}
                    {isOpen && (
                      <div className="border-t border-border bg-muted/20 px-4 sm:px-5 py-4">
                        {isLoading ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[1, 2].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
                          </div>
                        ) : events.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            {lang === 'hi' ? 'इस वर्ष के लिए कोई कार्यक्रम नहीं।' : 'No events for this year yet.'}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {events.map((ev, i) => (
                              <Link
                                key={ev.id}
                                href={`/events/${ev.slug}`}
                                className="group flex gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/40 hover:shadow-md transition-all animate-slide-up"
                                style={{ animationDelay: `${i * 50}ms` }}
                              >
                                {ev.cover_url ? (
                                  <div className="h-16 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={ev.cover_url}
                                      alt={ev.name}
                                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-16 w-20 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                    {ev.name}
                                  </h3>
                                  {ev.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{ev.description}</p>
                                  )}
                                  <div className="flex gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />{ev.photo_count}</span>
                                    <span className="flex items-center gap-1"><Video className="h-3 w-3" />{ev.video_count}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
