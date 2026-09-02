'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import type { Event, EventForm, FormField } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import { RegistrationForm } from './registration-form';

export default function RegisterPage() {
  const params = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/events/slug/${encodeURIComponent(params.slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(async (ev: Event | null) => {
        if (!ev) { setNotFound(true); setLoading(false); return; }
        setEvent(ev);
        const fr = await fetch(`/api/events/${ev.id}/form`).then(r => r.ok ? r.json() : null);
        if (fr && fr.form) { setForm(fr.form); setFields(fr.fields ?? []); }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params?.slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFound || !event) return (
    <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-muted-foreground">{t('events','notFound')}</p>
    </div>
  );

  const title = (lang === 'en' && (event as any).title_en) ? (event as any).title_en : event.title;
  const now = new Date();
  const regEnded     = event.registration_end   ? now > new Date(event.registration_end)   : false;
  const regNotStarted= event.registration_start ? now < new Date(event.registration_start) : false;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="bg-secondary/5 py-10 sm:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 sm:mb-6">
            <ArrowLeft className="h-4 w-4" /> {t('events','backToEvent')}
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{t('events','regFor')}</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{title}</span>
            {event.start_date && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(event.start_date, lang)}</span>}
            {event.venue      && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.venue}</span>}
          </div>
        </div>
      </section>

      <section className="flex-1 py-10 sm:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {regEnded ? (
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-2">{t('events','regClosed2')}</h2>
                <p className="text-sm text-muted-foreground">{t('events','regClosedDesc')}</p>
              </div>
            ) : regNotStarted ? (
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-2">{t('events','regNotStarted')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('events','regOpensOn')} {event.registration_start ? formatDate(event.registration_start, lang) : ''}
                </p>
              </div>
            ) : !form || fields.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-2">{t('events','noFormConfig')}</h2>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:p-8">
                {form.description && (
                  <p className="text-sm text-muted-foreground mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-border">{form.description}</p>
                )}
                {event.registration_end && (
                  <div className="mb-5 sm:mb-6 rounded-lg bg-secondary/10 px-4 py-3 text-xs sm:text-sm text-secondary">
                    {t('events','regClosesOn')} {formatDate(event.registration_end, lang)}
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
