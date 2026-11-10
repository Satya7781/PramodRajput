import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/i18n';
import { Toaster } from '@/components/ui/sonner';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

const SITE_TAGLINE = process.env.NEXT_PUBLIC_SITE_TAGLINE ?? 'Serving People, Building Tomorrow';
const SITE_DESC    = process.env.NEXT_PUBLIC_SITE_DESC    ?? `Official digital platform of ${SITE_NAME} — public servant, community leader, and advocate for grassroots development.`;
const FAVICON_URL  = process.env.NEXT_PUBLIC_FAVICON_URL  ?? '/favicon.png';

const HOME_METADATA = {
  hi: {
    title: `${SITE_NAME} | जनसेवा और विकास`,
    description: 'प्रमोद राजपूत की जनसेवा यात्रा, कार्यक्रम, समाचार, उपलब्धियों और सामाजिक पहलों की आधिकारिक वेबसाइट।',
  },
  en: {
    title: `${SITE_NAME} | Serving People, Building Tomorrow`,
    description: `Official digital platform of ${SITE_NAME} — public servant, community leader, and advocate for grassroots development.`,
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = headers().get('x-locale') === 'en' ? 'en' : 'hi';
  const copy = HOME_METADATA[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${locale}/`,
      languages: { hi: '/hi/', en: '/en/', 'x-default': '/hi/' },
    },
    icons: {
      icon: [
        { url: FAVICON_URL, sizes: '32x32', type: 'image/png' },
        { url: FAVICON_URL, sizes: '192x192', type: 'image/png' },
      ],
      shortcut: FAVICON_URL,
      apple: [{ url: FAVICON_URL, sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${SITE_URL}/${locale}/`,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
      siteName: SITE_NAME,
      type: 'website',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
    },
  };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
