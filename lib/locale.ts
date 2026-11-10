export const SUPPORTED_LOCALES = ['hi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'hi';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'hi' || value === 'en';
}

export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

export function localizedPath(pathname: string, locale: Locale): string {
  const withoutLocale = pathname.replace(/^\/(hi|en)(?=\/|$)/, '') || '/';
  return `/${locale}${withoutLocale === '/' ? '/' : withoutLocale}`;
}
