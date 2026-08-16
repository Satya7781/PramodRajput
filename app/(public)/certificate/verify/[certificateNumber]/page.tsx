import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Certificate, Event } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { ShieldCheck, ShieldX, AlertCircle, ArrowLeft, Calendar, MapPin, Award, User } from 'lucide-react';

async function getCertificate(certificateNumber: string) {
  const { data } = await supabase
    .from('certificates')
    .select('*, events(*)')
    .eq('certificate_number', certificateNumber)
    .maybeSingle();
  return data as (Certificate & { events?: Event }) | null;
}

export async function generateMetadata({ params }: { params: { certificateNumber: string } }) {
  return {
    title: `Certificate Verification — ${params.certificateNumber}`,
    description: 'Verify the authenticity of a certificate.',
  };
}

export default async function CertificateResultPage({ params }: { params: { certificateNumber: string } }) {
  const certificate = await getCertificate(params.certificateNumber);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/certificate/verify"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Verify Another Certificate
            </Link>

            {!certificate ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center animate-scale-in">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Certificate Not Found</h1>
                <p className="text-muted-foreground">
                  No certificate was found with the number <span className="font-mono font-semibold">{params.certificateNumber}</span>.
                  Please check the number and try again.
                </p>
              </div>
            ) : certificate.status === 'revoked' ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center animate-scale-in">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                  <ShieldX className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Certificate Revoked</h1>
                <p className="text-muted-foreground mb-6">
                  This certificate has been revoked and is no longer valid.
                </p>
                <div className="rounded-xl bg-card border border-border p-6 text-left space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Certificate Number</p>
                    <p className="font-mono font-semibold">{certificate.certificate_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participant</p>
                    <p className="font-medium">{certificate.participant_name}</p>
                  </div>
                  {certificate.revocation_reason && (
                    <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="text-sm">{certificate.revocation_reason}</p>
                    </div>
                  )}
                  {certificate.revoked_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Revoked On</p>
                      <p className="text-sm">{formatDate(certificate.revoked_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-8 animate-scale-in">
                <div className="text-center mb-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 mb-6">
                    <ShieldCheck className="h-8 w-8 text-secondary" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Certificate Verified</h1>
                  <p className="text-muted-foreground">This certificate is valid and authentic.</p>
                </div>

                <div className="rounded-xl bg-card border border-border p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                        <Award className="h-3.5 w-3.5" />
                        Certificate Number
                      </p>
                      <p className="font-mono font-semibold text-primary">{certificate.certificate_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                        <User className="h-3.5 w-3.5" />
                        Participant
                      </p>
                      <p className="font-medium">{certificate.participant_name}</p>
                    </div>
                    {certificate.events && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Event</p>
                          <p className="font-medium">{certificate.events.title}</p>
                        </div>
                        {certificate.events.start_date && (
                          <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Event Date
                            </p>
                            <p className="font-medium">{formatDate(certificate.events.start_date)}</p>
                          </div>
                        )}
                        {certificate.events.venue && (
                          <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                              <MapPin className="h-3.5 w-3.5" />
                              Venue
                            </p>
                            <p className="font-medium">{certificate.events.venue}</p>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                      <p className="font-medium">{formatDate(certificate.issued_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span className="inline-block rounded-full bg-secondary/10 text-secondary px-3 py-0.5 text-xs font-medium">
                        Valid
                      </span>
                    </div>
                  </div>
                </div>

                {certificate.pdf_url && (
                  <div className="mt-6 text-center">
                    <a
                      href={certificate.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      Download Certificate
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
