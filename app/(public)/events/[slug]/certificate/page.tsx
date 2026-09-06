'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Search, Loader2,
  Download, XCircle, Award
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Event } from '@/lib/types';

interface CertificateResult {
  id: string;
  certificate_number: string;
  participant_name: string;
  issue_date: string;
  status: 'issued' | 'revoked';
  event_title: string;
  certificate_url: string | null;
}

export default function EventCertificatePage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();

  const [event, setEvent]         = useState<Event | null>(null);
  const [regNumber, setRegNumber] = useState('');
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [cert, setCert]           = useState<CertificateResult | null>(null);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/events/slug/${encodeURIComponent(slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(ev => setEvent(ev));
  }, [slug]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;
    setLoading(true);
    setError('');
    setCert(null);
    setSearched(false);

    try {
      const res = await fetch(
        `/api/certificates/verify/${encodeURIComponent(regNumber.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data) {
        setError(lang === 'hi' ? 'प्रमाण पत्र नहीं मिला। कृपया पंजीकरण नंबर जाँचें।' : 'Certificate not found. Please check your registration number.');
      } else if (data.status === 'revoked') {
        setError(lang === 'hi' ? 'यह प्रमाण पत्र रद्द कर दिया गया है।' : 'This certificate has been revoked.');
      } else {
        setCert(data);
      }
    } catch {
      setError(lang === 'hi' ? 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const title = event
    ? ((lang === 'en' && (event as any).title_en) ? (event as any).title_en : event.title)
    : '';

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            {title || (lang === 'hi' ? 'कार्यक्रम पर वापस' : 'Back to Event')}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {lang === 'hi' ? 'प्रमाण पत्र डाउनलोड करें' : 'Download Certificate'}
            </h1>
          </div>
          {title && (
            <p className="text-sm text-muted-foreground">
              {lang === 'hi' ? `कार्यक्रम: ${title}` : `Event: ${title}`}
            </p>
          )}
        </div>
      </section>

      {/* Search */}
      <section className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <p className="text-sm text-muted-foreground mb-6">
              {lang === 'hi'
                ? 'अपना प्रमाण पत्र डाउनलोड करने के लिए अपना पंजीकरण नंबर दर्ज करें।'
                : 'Enter your registration number to find and download your participation certificate.'}
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="regNumber" className="block text-sm font-medium mb-1.5">
                  {lang === 'hi' ? 'पंजीकरण नंबर' : 'Registration Number'}
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="regNumber"
                    type="text"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    placeholder="e.g., PR-2026-000001"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {loading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Search className="h-4 w-4" />}
                    {lang === 'hi' ? 'खोजें' : 'Search'}
                  </button>
                </div>
              </div>
            </form>

            {/* Error state */}
            {searched && error && (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Certificate found */}
            {searched && cert && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-900/10 p-5 sm:p-6 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h2 className="font-bold text-green-800 dark:text-green-300">
                    {lang === 'hi' ? 'प्रमाण पत्र मिल गया!' : 'Certificate Found!'}
                  </h2>
                </div>

                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === 'hi' ? 'नाम' : 'Name'}</span>
                    <span className="font-semibold">{cert.participant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === 'hi' ? 'प्रमाण पत्र नंबर' : 'Certificate No.'}</span>
                    <span className="font-mono font-semibold">{cert.certificate_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === 'hi' ? 'कार्यक्रम' : 'Event'}</span>
                    <span className="font-semibold text-right max-w-[60%]">{cert.event_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === 'hi' ? 'जारी तारीख' : 'Issue Date'}</span>
                    <span className="font-semibold">
                      {new Date(cert.issue_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {cert.certificate_url ? (
                  <a
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 text-white px-4 py-3 text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {lang === 'hi' ? 'प्रमाण पत्र डाउनलोड करें' : 'Download Certificate'}
                  </a>
                ) : (
                  <div className="text-center rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                    {lang === 'hi'
                      ? 'प्रमाण पत्र जल्द उपलब्ध होगा।'
                      : 'Certificate will be available for download soon.'}
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground mt-3">
                  {lang === 'hi'
                    ? 'अपना प्रमाण पत्र नंबर संभाल कर रखें।'
                    : 'Keep your certificate number safe for future reference.'}
                </p>
              </div>
            )}
          </div>

          {/* Also link to general verify */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            {lang === 'hi' ? 'किसी भी प्रमाण पत्र की जाँच करें — ' : 'Verify any certificate — '}
            <Link href="/certificate/verify" className="text-primary hover:underline">
              {lang === 'hi' ? 'प्रमाण पत्र सत्यापन' : 'Certificate Verification'}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
