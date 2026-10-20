'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function CertificateVerifyForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [certNumber, setCertNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certNumber.trim();
    if (!trimmed) { setError('Please enter a certificate number.'); return; }
    setError('');
    setLoading(true);
    // router.push is synchronous in Next.js 13 — loading state conveys navigation progress.
    // We reset it on a small timeout to avoid "stuck spinner" if navigation is instant.
    router.push(`/certificate/verify/${encodeURIComponent(trimmed)}`);
    // Reset after 3 s in case navigation doesn't unmount (e.g. same-page error state)
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      <div className="space-y-2">
        <Label htmlFor="certNumber" className="text-sm sm:text-base">
          {t('certificate', 'numberLabel')}
        </Label>
        <Input
          id="certNumber"
          value={certNumber}
          onChange={e => { setCertNumber(e.target.value); setError(''); }}
          placeholder="e.g., PR-CERT-2026-000001"
          className={`text-center text-base sm:text-lg font-mono ${error ? 'border-destructive' : ''}`}
          aria-describedby={error ? 'cert-error' : undefined}
          aria-invalid={!!error}
          autoComplete="off"
          inputMode="text"
        />
        {error && (
          <p id="cert-error" className="text-xs text-destructive">{error}</p>
        )}
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('certificate', 'verifying')}</>
          : <><Search className="h-4 w-4 mr-2" />{t('certificate', 'verifyBtn')}</>}
      </Button>
    </form>
  );
}
