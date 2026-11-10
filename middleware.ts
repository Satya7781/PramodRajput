import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from './lib/locale';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1];

  if (isLocale(firstSegment)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname.replace(new RegExp(`^/${firstSegment}`), '') || '/';
    const response = NextResponse.rewrite(rewriteUrl);
    response.cookies.set('pr_lang', firstSegment, { path: '/', maxAge: 31536000, sameSite: 'lax' });
    response.headers.set('x-locale', firstSegment);
    return response;
  }

  const locale = request.cookies.get('pr_lang')?.value;
  const targetLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === '/' ? '/' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.png|.*\\..*).*)'],
};
