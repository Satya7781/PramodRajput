import { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locale';

export function getRequestLocale(request: NextRequest): Locale {
  const pathLocale = request.nextUrl.pathname.split('/')[1];
  if (isLocale(pathLocale)) return pathLocale;
  const queryLocale = request.nextUrl.searchParams.get('locale');
  if (isLocale(queryLocale)) return queryLocale;
  const cookieLocale = request.cookies.get('pr_lang')?.value;
  return isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
}

export function localizedError(locale: Locale, key: 'name' | 'email' | 'message' | 'emailFormat' | 'messageLength' | 'generic') {
  const messages = {
    name: { hi: 'नाम आवश्यक है', en: 'Name is required' },
    email: { hi: 'ईमेल आवश्यक है', en: 'Email is required' },
    message: { hi: 'संदेश आवश्यक है', en: 'Message is required' },
    emailFormat: { hi: 'कृपया मान्य ईमेल पता दर्ज करें', en: 'Please enter a valid email address' },
    messageLength: { hi: 'संदेश कम से कम 10 अक्षरों का होना चाहिए', en: 'Message must be at least 10 characters' },
    generic: { hi: 'संदेश भेजने में विफल। कृपया पुनः प्रयास करें।', en: 'Failed to send message. Please try again.' },
  } as const;
  return messages[key][locale];
}
