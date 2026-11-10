'use client';

import type { ResolvedContent } from '@/lib/content-fallback';
import { useLanguage } from '@/lib/i18n';

export function TranslationFallback({ result }: { result: ResolvedContent<unknown> }) {
  const { t } = useLanguage();
  if (!result.isFallback) return null;
  return (
    <span className="text-[10px] text-muted-foreground" title={t('common', 'translationFallback')}>
      ({t('common', 'translationFallback')})
    </span>
  );
}
