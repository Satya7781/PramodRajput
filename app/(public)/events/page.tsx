'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import type { Event } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

function getEventStatus(e: Event): 'upcoming' | 'ongoing' | 'past' {
  if (!e.start_date) return 'upcoming';
  const now = new Date(); const s = new Date(e.start_date);
  const end = e.end_date ? new Date(e.end_date) : s;
  if (now < s) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

export default function EventsPage() {
  const { lang, t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(d => { setEvents(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const upcoming = events.filter(e => getEventStatus(e) === 'upcoming');
  const ongoing  = events.filter(e => getEventStatus(e) === 'ongoing');
  const past     = events.filter(e => getEventStatus(e) === 'past');

  const sections = [
    { label: t('events', 'ongoing'),  items: ongoing,  color: 'text-secondary', empty: t('events', 'noOngoing') },
    { label: t('events', 'upcoming'), items: upcoming, color: 'text-primary',   empty: t('events', 'noUpcoming') },
    { label: t('events', 'past'),     items: past,     color: 'text-muted-foreground', empty: t('events', 'noPast') },
  ];

  const Card = ({ event, i }: { event: Event; i: number }) => (
    <Link href={`/events/${event.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
      <div className="aspect-[16/10] overflow-hidden bg-muted relative">
        {event.banner_url
          ? <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          : <div className="h-full w-full flex items-center justify-center bg-muted"><Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" /></div>}
        {event.status === 'registration_open' && (
          <span className="absolute top-3 right-3 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium">{t('events', 'regOpen')}</span>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mb-2">
          {event.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.start_date, lang)}</span>}
          {event.venue     && <span className="flex items-center gap-1 truncate max-w-[120px]"><MapPin className="h-3 w-3 shrink-0" />{event.venue}</span>}
        </div>
        <h3 className="font-bold mb-1.5 group-hover:text-primary transition-colors text-sm sm:text-base line-clamp-2 leading-snug">{event.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">{event.short_description}</p>
        {event.max_participants && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Users className="h-3 w-3" /> {t('events', 'capacity')}: {event.max_participants}
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary group-hover:gap-2 transition-all">
          {t('common', 'viewDetails')} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col">
      <section className="py-16 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('events', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('events', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('events', 'desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-12 sm:space-y-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-64 animate-pulse" />)}
            </div>
          ) : sections.map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <h2 className={`text-xl sm:text-2xl font-bold ${section.color}`}>{section.label}</h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs sm:text-sm text-muted-foreground">{section.items.length}</span>
              </div>
              {section.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {section.items.map((event, i) => <Card key={event.id} event={event} i={i} />)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{section.empty}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
