'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight, Info, Loader2 } from 'lucide-react';
import type { Event } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate, formatTime } from '@/lib/date-utils';

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/events/slug/${encodeURIComponent(params.slug)}`)
      .then(r => {
        if (!r.ok) { setNotFoundState(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => { if (data) setEvent(data); setLoading(false); })
      .catch(() => { setNotFoundState(true); setLoading(false); });
  }, [params?.slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFoundState || !event) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{t('events', 'notFound')}</h1>
        <Link href="/events" className="text-primary underline text-sm">{t('events', 'tag')}</Link>
      </div>
    </div>
  );

  // Use bilingual fields if present, fall back to default
  const title       = (lang === 'en' && (event as any).title_en)       ? (event as any).title_en       : event.title;
  const description = (lang === 'en' && (event as any).description_en) ? (event as any).description_en : event.description;
  const shortDesc   = (lang === 'en' && (event as any).short_description_en) ? (event as any).short_description_en : event.short_description;

  const registrationOpen = event.registration_enabled && event.status === 'registration_open';
  const regEnded = event.registration_end ? new Date() > new Date(event.registration_end) : false;

  return (
    <div className="flex flex-col">
      <section className="relative h-64 sm:h-[380px] lg:h-[420px] overflow-hidden">
        <div className="absolute inset-0">
          {event.banner_url
            ? <img src={event.banner_url} alt={title} className="h-full w-full object-cover" />
            : <div className="h-full w-full bg-secondary/20" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex items-end pb-8 sm:pb-12">
          <div className="max-w-3xl animate-slide-up">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.status === 'registration_open' && (
                <span className="rounded-full bg-secondary text-secondary-foreground px-3 py-0.5 text-xs font-medium">{t('events','regOpen')}</span>
              )}
              {event.certificate_enabled && (
                <span className="rounded-full bg-white/20 border border-white/30 text-white px-3 py-0.5 text-xs font-medium">{t('events','certAvailable')}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 text-balance">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-xs sm:text-sm">
              {event.start_date && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(event.start_date, lang)}</span>}
              {event.start_time && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatTime(event.start_time)}</span>}
              {event.venue      && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('events','aboutEvent')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {description || shortDesc}
                </p>
              </div>
              {shortDesc && description && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Info className="h-4 w-4 text-primary" />{t('events','quickSummary')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{shortDesc}</p>
                </div>
              )}
            </div>

            <div>
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 sticky top-20">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">{t('events','detailsCard')}</h3>
                <dl className="space-y-4 text-xs sm:text-sm">
                  {event.start_date && <div><dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Calendar className="h-3.5 w-3.5" />{t('events','startDate')}</dt><dd className="font-medium">{formatDate(event.start_date, lang)}</dd></div>}
                  {event.end_date   && <div><dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Calendar className="h-3.5 w-3.5" />{t('events','endDate')}</dt><dd className="font-medium">{formatDate(event.end_date, lang)}</dd></div>}
                  {event.start_time && <div><dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Clock className="h-3.5 w-3.5" />{t('events','time')}</dt><dd className="font-medium">{formatTime(event.start_time)}{event.end_time ? ` — ${formatTime(event.end_time)}` : ''}</dd></div>}
                  {event.venue      && <div><dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><MapPin className="h-3.5 w-3.5" />{t('events','venue')}</dt><dd className="font-medium">{event.venue}</dd></div>}
                  {event.address    && <div><dt className="text-muted-foreground mb-0.5">{t('events','address')}</dt><dd className="font-medium">{event.address}</dd></div>}
                  {event.max_participants && <div><dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Users className="h-3.5 w-3.5" />{t('events','capacity')}</dt><dd className="font-medium">{event.max_participants} {t('events','participants')}</dd></div>}
                </dl>

                {registrationOpen && !regEnded ? (
                  <Link href={`/events/${event.slug}/register`} className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95">
                    {t('events','registerBtn')} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : regEnded ? (
                  <p className="mt-5 text-center text-xs sm:text-sm text-muted-foreground">{t('events','regDeadline')}</p>
                ) : (
                  <p className="mt-5 text-center text-xs sm:text-sm text-muted-foreground">{t('events','regUnavailable')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
