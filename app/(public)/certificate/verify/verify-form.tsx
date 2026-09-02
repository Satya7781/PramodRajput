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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setLoading(true);
    router.push(`/certificate/verify/${certNumber.trim()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="certNumber" className="text-sm sm:text-base">{t('certificate', 'numberLabel')}</Label>
        <Input
          id="certNumber"
          value={certNumber}
          onChange={e => setCertNumber(e.target.value)}
          placeholder="e.g., PR-CERT-2026-000001"
          className="text-center text-base sm:text-lg font-mono"
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('certificate', 'verifying')}</>
          : <><Search className="h-4 w-4 mr-2" />{t('certificate', 'verifyBtn')}</>}
      </Button>
    </form>
  );
}
