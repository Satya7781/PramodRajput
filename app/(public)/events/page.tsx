'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronUp, Calendar, ImageIcon, Video,
  FolderOpen, MapPin, Users, ArrowRight, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import type { Event } from '@/lib/types';

/* ─── Gallery archive types ──────────────────────────────────── */
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

type Tab = 'live' | 'archive';

/* ─── Status badge helpers ───────────────────────────────────── */
function statusBadge(event: Event, lang: string) {
  const now = new Date();
  const start = event.start_date ? new Date(event.start_date) : null;
  const end   = event.end_date   ? new Date(event.end_date)   : null;

  if (start && end && now >= start && now <= end)
    return { label: lang === 'hi' ? 'जारी है' : 'Ongoing', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' };
  if (start && now < start)
    return { label: lang === 'hi' ? 'आगामी' : 'Upcoming', cls: 'bg-primary/10 text-primary' };
  return null;
}

export default function EventsPage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('live');

  /* Live events */
  const [liveEvents, setLiveEvents]   = useState<Event[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  /* Archive */
  const [yearSummaries, setYearSummaries] = useState<YearSummary[]>([]);
  const [openYear, setOpenYear]           = useState<number | null>(null);
  const [yearEvents, setYearEvents]       = useState<Record<number, GalleryEvent[]>>({});
  const [loadingYears, setLoadingYears]   = useState(false);
  const [loadingEvents, setLoadingEvents] = useState<number | null>(null);

  /* Load live events on mount */
  useEffect(() => {
    fetch('/api/events?status=ongoing,upcoming&limit=20')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLiveEvents(Array.isArray(d) ? d : []); setLiveLoading(false); })
      .catch(() => setLiveLoading(false));
  }, []);

  /* Load archive summaries when tab switches */
  useEffect(() => {
    if (activeTab !== 'archive' || yearSummaries.length > 0) return;
    setLoadingYears(true);
    fetch('/api/gallery-events')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setYearSummaries(Array.isArray(d) ? d : []); setLoadingYears(false); })
      .catch(() => setLoadingYears(false));
  }, [activeTab, yearSummaries.length]);

  const getSummary = (year: number) => yearSummaries.find(y => y.year === year);

  const toggleYear = async (year: number) => {
    if (openYear === year) { setOpenYear(null); return; }
    setOpenYear(year);
    if (yearEvents[year]) return;
    setLoadingEvents(year);
    try {
      const data = await fetch(`/api/gallery-events?year=${year}`)
        .then(r => r.json())
        .then(d => Array.isArray(d) ? d : []);
      setYearEvents(prev => ({ ...prev, [year]: data }));
    } finally {
      setLoadingEvents(null);
    }
  };

  const ongoing  = liveEvents.filter(e => {
    const now = new Date();
    const s = e.start_date ? new Date(e.start_date) : null;
    const en = e.end_date   ? new Date(e.end_date)   : null;
    return s && en && now >= s && now <= en;
  });
  const upcoming = liveEvents.filter(e => {
    const now = new Date();
    const s = e.start_date ? new Date(e.start_date) : null;
    return s && now < s;
  });

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              {t('events', 'tag')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 text-balance">
              {t('events', 'title')}
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
              {t('events', 'desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 flex gap-1 py-2">
          {(['live', 'archive'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors
                ${activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {tab === 'live'
                ? <><Clock className="h-4 w-4" />{lang === 'hi' ? 'जारी / आगामी' : 'Ongoing & Upcoming'}</>
                : <><FolderOpen className="h-4 w-4" />{lang === 'hi' ? 'पुरालेख' : 'Past Archive'}</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live Events Tab ── */}
      {activeTab === 'live' && (
        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl space-y-10">

            {liveLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : liveEvents.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('events', 'noUpcoming')}</p>
              </div>
            ) : (
              <>
                {/* Ongoing */}
                {ongoing.length > 0 && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                      {t('events', 'ongoing')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {ongoing.map((ev, i) => (
                        <EventCard key={ev.id} event={ev} lang={lang} t={t} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {t('events', 'upcoming')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {upcoming.map((ev, i) => (
                        <EventCard key={ev.id} event={ev} lang={lang} t={t} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Archive Tab ── */}
      {activeTab === 'archive' && (
        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {loadingYears ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {ALL_YEARS.map(year => {
                  const summary  = getSummary(year);
                  const isOpen   = openYear === year;
                  const events   = Array.isArray(yearEvents[year]) ? yearEvents[year] : [];
                  const isLoading = loadingEvents === year;

                  return (
                    <div
                      key={year}
                      className={`rounded-xl border transition-all duration-200
                        ${isOpen ? 'border-primary/40 shadow-md' : 'border-border hover:border-primary/20'}`}
                    >
                      <button
                        onClick={() => toggleYear(year)}
                        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors cursor-pointer
                          ${isOpen ? 'bg-primary/5' : 'bg-card hover:bg-muted/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${isOpen ? 'text-primary' : ''}`}>
                            {year}
                          </span>
                          {summary && (
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                <FolderOpen className="h-3 w-3" />{summary.event_count} {lang === 'hi' ? 'कार्यक्रम' : 'events'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />{summary.photo_count}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                <Video className="h-3 w-3" />{summary.video_count}
                              </span>
                            </div>
                          )}
                        </div>
                        {isOpen
                          ? <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                          : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-border bg-muted/20 px-4 sm:px-5 py-4">
                          {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
                            </div>
                          ) : events.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                              {lang === 'hi' ? 'इस वर्ष के लिए कोई कार्यक्रम नहीं।' : 'No events for this year yet.'}
                            </p>
                          ) : (
                            <>
                              <p className="text-xs text-muted-foreground mb-3 font-medium">
                                {events.length} {lang === 'hi' ? 'कार्यक्रम' : 'events'}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {events.map((ev, i) => (
                                  <Link
                                    key={ev.id}
                                    href={`/events/${ev.slug}`}
                                    className="group flex gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-md transition-all"
                                  >
                                    {ev.cover_url ? (
                                      <div className="h-14 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                                        <img src={ev.cover_url} alt={ev.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                      </div>
                                    ) : (
                                      <div className="h-14 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">{ev.name}</h3>
                                      {ev.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{ev.description}</p>}
                                      <div className="flex gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />{ev.photo_count}</span>
                                        <span className="flex items-center gap-1"><Video className="h-3 w-3" />{ev.video_count}</span>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </>
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
      )}
    </div>
  );
}

/* ─── Live Event Card ─────────────────────────────────────────── */
function EventCard({ event, lang, t, index }: { event: Event; lang: string; t: Function; index: number }) {
  const badge = statusBadge(event, lang);
  const title = (lang === 'en' && (event as any).title_en) ? (event as any).title_en : event.title;
  const now = new Date();
  const regOpen = event.registration_enabled &&
    (!event.registration_start || now >= new Date(event.registration_start)) &&
    (!event.registration_end   || now <= new Date(event.registration_end));

  return (
    <div
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all animate-slide-up flex flex-col"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {(event as any).cover_image_url ? (
          <img
            src={(event as any).cover_image_url}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Calendar className="h-10 w-10 text-muted-foreground opacity-40" />
          </div>
        )}
        {badge && (
          <span className={`absolute top-2.5 left-2.5 text-xs font-semibold rounded-full px-2.5 py-0.5 ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        {event.certificate_enabled && (
          <span className="absolute top-2.5 right-2.5 text-xs font-semibold rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {lang === 'hi' ? 'प्रमाण पत्र' : 'Certificate'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <h3 className="font-bold text-base leading-snug line-clamp-2">{title}</h3>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {event.start_date && (
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              {formatDate(event.start_date, lang)}
              {event.end_date && event.end_date !== event.start_date && ` — ${formatDate(event.end_date, lang)}`}
            </p>
          )}
          {event.venue && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span className="line-clamp-1">{event.venue}</span>
            </p>
          )}
          {event.max_participants && (
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              {lang === 'hi' ? `${event.max_participants} ${t('events','participants')}` : `${event.max_participants} ${t('events','participants')}`}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          {regOpen ? (
            <Link
              href={`/events/${event.slug}/register`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {t('common', 'register')} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {t('events', 'regClosed')}
            </span>
          )}
          {event.certificate_enabled && (
            <Link
              href={`/events/${event.slug}/certificate`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              {lang === 'hi' ? 'प्रमाण पत्र डाउनलोड करें' : 'Download Certificate'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
