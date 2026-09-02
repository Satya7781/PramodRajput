'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldX, AlertCircle, ArrowLeft, Calendar, MapPin, Award, User, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import type { Certificate } from '@/lib/types';

interface CertResult extends Certificate {
  event_title?: string;
  start_date?: string;
  venue?: string;
}

export default function CertificateResultPage() {
  const params = useParams<{ certificateNumber: string }>();
  const { lang, t } = useLanguage();
  const [certificate, setCertificate] = useState<CertResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.certificateNumber) return;
    fetch(`/api/certificates/verify/${encodeURIComponent(params.certificateNumber)}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then(data => { if (data) setCertificate(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params?.certificateNumber]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex items-center justify-center py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-xl mx-auto">
            <Link href="/certificate/verify" className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8">
              <ArrowLeft className="h-4 w-4" /> {t('certificate','verifyAnother')}
            </Link>

            {/* Not found */}
            {(notFound || !certificate) && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 text-center animate-scale-in">
                <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10 mb-5 sm:mb-6">
                  <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mb-3">{t('certificate','notFound')}</h1>
                <p className="text-sm text-muted-foreground">{t('certificate','notFoundDesc')}</p>
              </div>
            )}

            {/* Revoked */}
            {certificate && certificate.status === 'revoked' && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 text-center animate-scale-in">
                <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10 mb-5 sm:mb-6">
                  <ShieldX className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mb-3">{t('certificate','revoked')}</h1>
                <p className="text-sm text-muted-foreground mb-5 sm:mb-6">{t('certificate','revokedDesc')}</p>
                <div className="rounded-xl bg-card border border-border p-5 text-left space-y-3">
                  <div><p className="text-xs sm:text-sm text-muted-foreground">{t('certificate','certNumber')}</p><p className="font-mono font-semibold text-sm sm:text-base">{certificate.certificate_number}</p></div>
                  <div><p className="text-xs sm:text-sm text-muted-foreground">{t('certificate','participant')}</p><p className="font-medium text-sm sm:text-base">{certificate.participant_name}</p></div>
                  {certificate.revocation_reason && <div><p className="text-xs sm:text-sm text-muted-foreground">{t('certificate','reason')}</p><p className="text-sm">{certificate.revocation_reason}</p></div>}
                  {certificate.revoked_at && <div><p className="text-xs sm:text-sm text-muted-foreground">{t('certificate','revokedOn')}</p><p className="text-sm">{formatDate(certificate.revoked_at, lang)}</p></div>}
                </div>
              </div>
            )}

            {/* Valid */}
            {certificate && certificate.status === 'valid' && (
              <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6 sm:p-8 animate-scale-in">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-secondary/10 mb-5 sm:mb-6">
                    <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-2">{t('certificate','verified')}</h1>
                  <p className="text-sm text-muted-foreground">{t('certificate','verifiedDesc')}</p>
                </div>
                <div className="rounded-xl bg-card border border-border p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1.5 mb-1 text-xs"><Award className="h-3.5 w-3.5" />{t('certificate','certNumber')}</p>
                      <p className="font-mono font-semibold text-primary text-sm">{certificate.certificate_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1.5 mb-1 text-xs"><User className="h-3.5 w-3.5" />{t('certificate','participant')}</p>
                      <p className="font-medium">{certificate.participant_name}</p>
                    </div>
                    {certificate.event_title && (
                      <div><p className="text-muted-foreground mb-1 text-xs">{t('certificate','event')}</p><p className="font-medium">{certificate.event_title}</p></div>
                    )}
                    {certificate.start_date && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1.5 mb-1 text-xs"><Calendar className="h-3.5 w-3.5" />{t('certificate','eventDate')}</p>
                        <p className="font-medium">{formatDate(certificate.start_date, lang)}</p>
                      </div>
                    )}
                    {certificate.venue && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1.5 mb-1 text-xs"><MapPin className="h-3.5 w-3.5" />{t('certificate','venueLabel')}</p>
                        <p className="font-medium">{certificate.venue}</p>
                      </div>
                    )}
                    <div><p className="text-muted-foreground mb-1 text-xs">{t('certificate','issueDate')}</p><p className="font-medium">{formatDate(certificate.issued_at, lang)}</p></div>
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs">{t('certificate','statusLabel')}</p>
                      <span className="inline-block rounded-full bg-secondary/10 text-secondary px-3 py-0.5 text-xs font-medium">{t('certificate','valid')}</span>
                    </div>
                  </div>
                </div>
                {certificate.pdf_url && (
                  <div className="mt-5 sm:mt-6 text-center">
                    <a href={certificate.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 sm:px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all">
                      {t('certificate','download')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
