import type { Lang } from '@/lib/i18n';

export interface ResolvedContent<T> {
  value: T | null;
  requestedLocale: Lang;
  contentLocale: Lang | null;
  isFallback: boolean;
  translationMissing: boolean;
}

export function resolveLocalized<T>(
  requestedLocale: Lang,
  hindi: T | null | undefined,
  english: T | null | undefined,
): ResolvedContent<T> {
  const requested = requestedLocale === 'en' ? english : hindi;
  const alternate = requestedLocale === 'en' ? hindi : english;
  if (requested != null && String(requested).trim() !== '') {
    return {
      value: requested,
      requestedLocale,
      contentLocale: requestedLocale,
      isFallback: false,
      translationMissing: false,
    };
  }
  if (alternate != null && String(alternate).trim() !== '') {
    return {
      value: alternate,
      requestedLocale,
      contentLocale: requestedLocale === 'en' ? 'hi' : 'en',
      isFallback: true,
      translationMissing: true,
    };
  }
  return {
    value: null,
    requestedLocale,
    contentLocale: null,
    isFallback: false,
    translationMissing: true,
  };
}
