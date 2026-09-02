'use client';

import { ShieldCheck } from 'lucide-react';
import { CertificateVerifyForm } from './verify-form';
import { useLanguage } from '@/lib/i18n';

export default function VerifyCertificatePage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex items-center justify-center py-16 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md sm:max-w-xl mx-auto text-center">
            <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-secondary/10 mb-5 sm:mb-6 animate-scale-in">
              <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-secondary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-balance">{t('certificate', 'verifyTitle')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">{t('certificate', 'verifyDesc')}</p>
            <CertificateVerifyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
