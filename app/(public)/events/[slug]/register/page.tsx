import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import type { Event, EventForm, FormField } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { RegistrationForm } from './registration-form';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getEventData(slug: string) {
  try {
    const eventRes = await fetch(`${BASE}/api/events/slug/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!eventRes.ok) return null;
    const event: Event = await eventRes.json();

    const formRes = await fetch(`${BASE}/api/events/${event.id}/form`, { cache: 'no-store' });
    if (!formRes.ok) return { event, form: null, fields: [] };

    const formData = await formRes.json();
    if (!formData) return { event, form: null, fields: [] };

    return {
      event,
      form: formData.form as EventForm | null,
      fields: (formData.fields ?? []) as FormField[],
    };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getEventData(params.slug);
  if (!data) return { title: 'Event Not Found' };
  return { title: `Register for ${data.event.title} — Pramod Rajput` };
}

export default async function RegisterPage({ params }: { params: { slug: string } }) {
  const data = await getEventData(params.slug);
  if (!data) notFound();

  const { event, form, fields } = data;
  const now = new Date();
  const regEnded = event.registration_end ? now > new Date(event.registration_end) : false;
  const regNotStarted = event.registration_start ? now < new Date(event.registration_start) : false;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="bg-secondary/5 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Event
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Register for Event</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{event.title}</span>
            {event.start_date && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(event.start_date)}</span>}
            {event.venue && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.venue}</span>}
          </div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {regEnded ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-bold mb-2">Registration Closed</h2>
                <p className="text-muted-foreground">The registration deadline for this event has passed.</p>
              </div>
            ) : regNotStarted ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-bold mb-2">Registration Not Yet Open</h2>
                <p className="text-muted-foreground">Registration opens on {event.registration_start ? formatDate(event.registration_start) : 'soon'}.</p>
              </div>
            ) : !form || fields.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-bold mb-2">No Registration Form Available</h2>
                <p className="text-muted-foreground">This event does not have a registration form configured yet.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                {form.description && (
                  <p className="text-muted-foreground mb-6 pb-6 border-b border-border">{form.description}</p>
                )}
                {event.registration_end && (
                  <div className="mb-6 rounded-lg bg-secondary/10 px-4 py-3 text-sm text-secondary">
                    Registration closes on {formatDate(event.registration_end)}
                  </div>
                )}
                <RegistrationForm eventId={event.id} formId={form.id} fields={fields} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
