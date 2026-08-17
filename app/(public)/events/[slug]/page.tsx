import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, Users, ArrowRight, Info } from 'lucide-react';
import type { Event } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/date-utils';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getEvent(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(`${BASE}/api/events/slug/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) return { title: 'Event Not Found' };
  return { title: `${event.title} — Pramod Rajput`, description: event.short_description || event.title };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) notFound();

  const registrationOpen = event.registration_enabled && event.status === 'registration_open';
  const now = new Date();
  const regEnded = event.registration_end ? now > new Date(event.registration_end) : false;

  return (
    <div className="flex flex-col">
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex items-end pb-12">
          <div className="max-w-3xl animate-slide-up">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {event.status === 'registration_open' && (
                <span className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">Registration Open</span>
              )}
              {event.certificate_enabled && (
                <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 text-xs font-medium">Certificate Available</span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-balance">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {event.start_date && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(event.start_date)}</span>}
              {event.start_time && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatTime(event.start_time)}</span>}
              {event.venue && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.venue}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description || event.short_description}
                </p>
              </div>
              {event.short_description && event.description && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Info className="h-4 w-4 text-primary" />Quick Summary</h3>
                  <p className="text-sm text-muted-foreground">{event.short_description}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 sticky top-20">
                <h3 className="font-semibold mb-4">Event Details</h3>
                <dl className="space-y-4 text-sm">
                  {event.start_date && (
                    <div>
                      <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Calendar className="h-3.5 w-3.5" />Start Date</dt>
                      <dd className="font-medium">{formatDate(event.start_date)}</dd>
                    </div>
                  )}
                  {event.end_date && (
                    <div>
                      <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Calendar className="h-3.5 w-3.5" />End Date</dt>
                      <dd className="font-medium">{formatDate(event.end_date)}</dd>
                    </div>
                  )}
                  {event.start_time && (
                    <div>
                      <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Clock className="h-3.5 w-3.5" />Time</dt>
                      <dd className="font-medium">{formatTime(event.start_time)}{event.end_time ? ` — ${formatTime(event.end_time)}` : ''}</dd>
                    </div>
                  )}
                  {event.venue && (
                    <div>
                      <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><MapPin className="h-3.5 w-3.5" />Venue</dt>
                      <dd className="font-medium">{event.venue}</dd>
                    </div>
                  )}
                  {event.address && (
                    <div>
                      <dt className="text-muted-foreground mb-0.5">Address</dt>
                      <dd className="font-medium">{event.address}</dd>
                    </div>
                  )}
                  {event.max_participants && (
                    <div>
                      <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5"><Users className="h-3.5 w-3.5" />Capacity</dt>
                      <dd className="font-medium">{event.max_participants} participants</dd>
                    </div>
                  )}
                </dl>

                {registrationOpen && !regEnded ? (
                  <Link href={`/events/${event.slug}/register`} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all">
                    Register Now <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : regEnded ? (
                  <p className="mt-6 text-center text-sm text-muted-foreground">Registration has closed.</p>
                ) : !event.registration_enabled ? (
                  <p className="mt-6 text-center text-sm text-muted-foreground">Registration is not available for this event.</p>
                ) : (
                  <p className="mt-6 text-center text-sm text-muted-foreground">Registration is currently closed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
