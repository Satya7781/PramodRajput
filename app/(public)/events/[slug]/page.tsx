'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ImageIcon, Video, X, ChevronLeft, ChevronRight,
  Play, Loader2, Calendar, MapPin, Users, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import type { Event } from '@/lib/types';

/* ── Gallery types ── */
interface GalleryEvent {
  id: string; year: number; name: string; slug: string;
  description: string | null; cover_url: string | null;
}
interface GalleryMedia {
  id: string; event_id: string; media_type: 'photo' | 'video';
  url: string; thumbnail: string | null; caption: string | null; sort_order: number;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();

  /* ── State ── */
  const [pageType, setPageType] = useState<'live' | 'gallery' | 'notfound' | null>(null);

  /* Live event */
  const [liveEvent, setLiveEvent] = useState<Event | null>(null);

  /* Gallery event */
  const [galleryEvent, setGalleryEvent] = useState<GalleryEvent | null>(null);
  const [media, setMedia]               = useState<GalleryMedia[]>([]);
  const [lightbox, setLightbox]         = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  const photos = media.filter(m => m.media_type === 'photo');
  const videos = media.filter(m => m.media_type === 'video');

  /* ── Load: try live event first, then gallery ── */
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/events/slug/${encodeURIComponent(slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(async (ev: Event | null) => {
        if (ev) {
          setLiveEvent(ev);
          setPageType('live');
          return;
        }
        // not a live event — try gallery
        const gev = await fetch(`/api/gallery-events/${slug}`).then(r => r.ok ? r.json() : null);
        if (!gev) { setPageType('notfound'); return; }
        setGalleryEvent(gev);
        const m = await fetch(`/api/gallery-events/${gev.id}/media`).then(r => r.ok ? r.json() : []);
        setMedia(Array.isArray(m) ? m : []);
        setPageType('gallery');
      })
      .catch(() => setPageType('notfound'));
  }, [slug]);

  /* ── Keyboard nav for lightbox ── */
  useEffect(() => {
    if (!lightbox.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox(l => ({ ...l, index: Math.min(l.index + 1, photos.length - 1) }));
      if (e.key === 'ArrowLeft')  setLightbox(l => ({ ...l, index: Math.max(l.index - 1, 0) }));
      if (e.key === 'Escape')     setLightbox({ open: false, index: 0 });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox.open, photos.length]);

  const getYouTubeEmbed = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  /* ─── Loading ─── */
  if (pageType === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ─── Not found ─── */
  if (pageType === 'notfound') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">{lang === 'hi' ? 'कार्यक्रम नहीं मिला' : 'Event not found'}</h1>
        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />{lang === 'hi' ? 'सभी कार्यक्रम' : 'All Events'}
        </Link>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     LIVE EVENT VIEW
  ═══════════════════════════════════════════════════════════ */
  if (pageType === 'live' && liveEvent) {
    const ev    = liveEvent;
    const title = (lang === 'en' && (ev as any).title_en) ? (ev as any).title_en : ev.title;
    const desc  = (lang === 'en' && (ev as any).description_en) ? (ev as any).description_en : ev.description;
    const now   = new Date();

    const isOngoing = ev.start_date && ev.end_date &&
      now >= new Date(ev.start_date) && now <= new Date(ev.end_date);
    const isUpcoming = ev.start_date && now < new Date(ev.start_date);

    const regOpen = ev.registration_enabled &&
      (!ev.registration_start || now >= new Date(ev.registration_start)) &&
      (!ev.registration_end   || now <= new Date(ev.registration_end));

    const regEnded    = ev.registration_end   && now > new Date(ev.registration_end);
    const regNotStart = ev.registration_start && now < new Date(ev.registration_start);

    return (
      <div className="flex flex-col">
        {/* Hero */}
        <section className={`relative overflow-hidden ${(ev as any).cover_image_url ? 'h-56 sm:h-80' : 'py-14 sm:py-20 bg-secondary/5'}`}>
          {(ev as any).cover_image_url && (
            <>
              <img src={(ev as any).cover_image_url} alt={title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </>
          )}
          <div className={`container mx-auto px-4 lg:px-8 ${(ev as any).cover_image_url ? 'relative z-10 h-full flex flex-col justify-end pb-8 sm:pb-10' : ''}`}>
            <Link href="/events" className={`inline-flex items-center gap-1.5 text-sm mb-3 transition-colors ${(ev as any).cover_image_url ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-primary'}`}>
              <ArrowLeft className="h-4 w-4" />{lang === 'hi' ? 'सभी कार्यक्रम' : 'All Events'}
            </Link>
            <div className="flex flex-wrap gap-2 mb-2">
              {isOngoing && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  {lang === 'hi' ? 'जारी है' : 'Ongoing'}
                </span>
              )}
              {isUpcoming && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 bg-white/20 text-white">
                  <Clock className="h-3 w-3" />{lang === 'hi' ? 'आगामी' : 'Upcoming'}
                </span>
              )}
              {ev.certificate_enabled && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <CheckCircle2 className="h-3 w-3" />{lang === 'hi' ? 'प्रमाण पत्र' : 'Certificate Available'}
                </span>
              )}
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-balance ${(ev as any).cover_image_url ? 'text-white' : ''}`}>
              {title}
            </h1>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {desc && (
                <div>
                  <h2 className="text-lg font-bold mb-3">{t('events','aboutEvent')}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{desc}</p>
                </div>
              )}

              {/* Certificate section */}
              {ev.certificate_enabled && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 text-amber-900 dark:text-amber-300">
                        {lang === 'hi' ? 'प्रमाण पत्र उपलब्ध है' : 'Certificate Available'}
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                        {lang === 'hi'
                          ? 'इस कार्यक्रम में भाग लेने वाले प्रतिभागी अपना प्रमाण पत्र डाउनलोड कर सकते हैं।'
                          : 'Participants of this event can download their participation certificate.'}
                      </p>
                      <Link
                        href={`/events/${ev.slug}/certificate`}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-700 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {lang === 'hi' ? 'प्रमाण पत्र डाउनलोड करें' : 'Download My Certificate'}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: event details + registration */}
            <div className="space-y-4">
              {/* Quick details card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-sm">{t('events','detailsCard')}</h3>
                <div className="space-y-2 text-sm">
                  {ev.start_date && (
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('events','startDate')}</p>
                        <p className="font-medium">{formatDate(ev.start_date, lang)}</p>
                      </div>
                    </div>
                  )}
                  {ev.end_date && (
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('events','endDate')}</p>
                        <p className="font-medium">{formatDate(ev.end_date, lang)}</p>
                      </div>
                    </div>
                  )}
                  {ev.venue && (
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('events','venue')}</p>
                        <p className="font-medium">{ev.venue}</p>
                      </div>
                    </div>
                  )}
                  {ev.max_participants && (
                    <div className="flex gap-2">
                      <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('events','capacity')}</p>
                        <p className="font-medium">{ev.max_participants} {t('events','participants')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration card */}
              {ev.registration_enabled && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-bold text-sm mb-3">{lang === 'hi' ? 'पंजीकरण' : 'Registration'}</h3>
                  {ev.registration_end && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('events','regClosesOn')}: <span className="font-medium text-foreground">{formatDate(ev.registration_end, lang)}</span>
                    </p>
                  )}
                  {ev.registration_start && regNotStart && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('events','regOpensOn')}: <span className="font-medium text-foreground">{formatDate(ev.registration_start, lang)}</span>
                    </p>
                  )}
                  {regOpen ? (
                    <Link
                      href={`/events/${ev.slug}/register`}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      {t('common','register')} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : regEnded ? (
                    <div className="text-center rounded-lg bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                      {t('events','regClosed')}
                    </div>
                  ) : regNotStart ? (
                    <div className="text-center rounded-lg bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                      {t('events','regNotStarted')}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     GALLERY EVENT VIEW (archive photos/videos)
  ═══════════════════════════════════════════════════════════ */
  if (pageType === 'gallery' && galleryEvent) {
    const ev = galleryEvent;
    return (
      <div className="flex flex-col">
        {/* Hero */}
        <section className={`relative overflow-hidden ${ev.cover_url ? 'h-52 sm:h-72' : 'py-14 sm:py-20 bg-secondary/5'}`}>
          {ev.cover_url && (
            <>
              <img src={ev.cover_url} alt={ev.name} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          )}
          <div className={`container mx-auto px-4 lg:px-8 ${ev.cover_url ? 'relative z-10 h-full flex flex-col justify-end pb-8 sm:pb-10' : ''}`}>
            <Link href="/events" className={`inline-flex items-center gap-1.5 text-sm mb-3 transition-colors ${ev.cover_url ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-primary'}`}>
              <ArrowLeft className="h-4 w-4" />{lang === 'hi' ? 'सभी कार्यक्रम' : 'All Events'}
            </Link>
            <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 mb-2 inline-block w-fit ${ev.cover_url ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
              {ev.year}
            </span>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-balance ${ev.cover_url ? 'text-white' : ''}`}>
              {ev.name}
            </h1>
            {ev.description && (
              <p className={`mt-2 text-sm sm:text-base max-w-2xl leading-relaxed ${ev.cover_url ? 'text-white/80' : 'text-muted-foreground'}`}>
                {ev.description}
              </p>
            )}
            <div className={`flex gap-4 mt-3 text-sm ${ev.cover_url ? 'text-white/70' : 'text-muted-foreground'}`}>
              <span className="flex items-center gap-1.5"><ImageIcon className="h-4 w-4" />{photos.length} {lang === 'hi' ? 'फ़ोटो' : 'photos'}</span>
              <span className="flex items-center gap-1.5"><Video className="h-4 w-4" />{videos.length} {lang === 'hi' ? 'वीडियो' : 'videos'}</span>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-10 sm:py-14 space-y-12">
          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {lang === 'hi' ? 'फ़ोटो' : 'Photos'}
                <span className="text-sm font-normal text-muted-foreground">({photos.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setLightbox({ open: true, index: i })}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/40 hover:shadow-lg transition-all animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}>
                    <img src={p.url} alt={p.caption ?? `Photo ${i + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-400" loading="lazy" />
                    {p.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-1.5 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{p.caption}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                {lang === 'hi' ? 'वीडियो' : 'Videos'}
                <span className="text-sm font-normal text-muted-foreground">({videos.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {videos.map((v, i) => {
                  const embedUrl = getYouTubeEmbed(v.url);
                  return (
                    <div key={v.id} className="rounded-xl border border-border overflow-hidden bg-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                      {embedUrl ? (
                        <div className="aspect-video">
                          <iframe src={embedUrl} title={v.caption ?? `Video ${i + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-black flex items-center justify-center relative group">
                          {v.thumbnail ? (
                            <>
                              <img src={v.thumbnail} alt={v.caption ?? ''} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                                <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-lg">
                                  <Play className="h-6 w-6 ml-1" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors">
                              <Play className="h-10 w-10" />
                              <span className="text-xs">{lang === 'hi' ? 'वीडियो देखें' : 'Watch Video'}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {v.caption && <div className="px-4 py-2.5 text-sm text-muted-foreground">{v.caption}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {media.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{lang === 'hi' ? 'अभी कोई मीडिया उपलब्ध नहीं है।' : 'No photos or videos uploaded yet.'}</p>
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightbox.open && photos.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4" onClick={() => setLightbox({ open: false, index: 0 })}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2" onClick={() => setLightbox({ open: false, index: 0 })}><X className="h-6 w-6" /></button>
            {lightbox.index > 0 && (
              <button className="absolute left-3 sm:left-6 text-white/80 hover:text-white bg-black/50 rounded-full p-2" onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index - 1 })); }}><ChevronLeft className="h-7 w-7" /></button>
            )}
            <img src={photos[lightbox.index].url} alt={photos[lightbox.index].caption ?? ''} className="max-h-[88vh] max-w-[88vw] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
            {lightbox.index < photos.length - 1 && (
              <button className="absolute right-3 sm:right-6 text-white/80 hover:text-white bg-black/50 rounded-full p-2" onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index + 1 })); }}><ChevronRight className="h-7 w-7" /></button>
            )}
            <div className="absolute bottom-4 text-white/60 text-sm select-none">
              {lightbox.index + 1} / {photos.length}
              {photos[lightbox.index].caption && <span className="ml-3 text-white/80">{photos[lightbox.index].caption}</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
