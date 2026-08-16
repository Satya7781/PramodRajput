import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Event } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';

export const metadata = {
  title: 'Events — Pramod Rajput',
  description: 'Browse upcoming and past events organized by Pramod Rajput and the community initiative.',
};

async function getEvents() {
  const { data } = await supabase
    .from('events')
    .select('*')
    .in('status', ['published', 'registration_open', 'registration_closed', 'completed'])
    .order('start_date', { ascending: true });

  return (data || []) as Event[];
}

function getEventStatus(event: Event): 'upcoming' | 'ongoing' | 'past' {
  if (!event.start_date) return 'upcoming';
  const now = new Date();
  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : start;
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => getEventStatus(e) === 'upcoming');
  const ongoing = events.filter((e) => getEventStatus(e) === 'ongoing');
  const past = events.filter((e) => getEventStatus(e) === 'past');

  const sections = [
    { label: 'Ongoing', items: ongoing, color: 'text-secondary' },
    { label: 'Upcoming', items: upcoming, color: 'text-primary' },
    { label: 'Past', items: past, color: 'text-muted-foreground' },
  ];

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Events</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">Community Events & Programs</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join us at upcoming events or explore past initiatives. Every gathering is an opportunity to connect,
              learn, and contribute to the community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-16">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-3 mb-8">
                <h2 className={`text-2xl font-bold ${section.color}`}>{section.label} Events</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {section.items.length}
                </span>
              </div>

              {section.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((event, i) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                        {event.banner_url ? (
                          <img
                            src={event.banner_url}
                            alt={event.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <Calendar className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        {event.status === 'registration_open' && (
                          <span className="absolute top-3 right-3 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">
                            Registration Open
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          {event.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(event.start_date)}
                            </span>
                          )}
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.venue}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {event.short_description}
                        </p>
                        {event.max_participants && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                            <Users className="h-3 w-3" />
                            Max {event.max_participants} participants
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                          View Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No {section.label.toLowerCase()} events at this time.</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
