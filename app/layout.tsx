import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

const SITE_NAME    = process.env.NEXT_PUBLIC_SITE_NAME    ?? 'Pramod Rajput';
const SITE_TAGLINE = process.env.NEXT_PUBLIC_SITE_TAGLINE ?? 'Serving People, Building Tomorrow';
const SITE_DESC    = process.env.NEXT_PUBLIC_SITE_DESC    ?? `Official digital platform of ${SITE_NAME} — public servant, community leader, and advocate for grassroots development.`;
const OG_IMAGE     = process.env.NEXT_PUBLIC_OG_IMAGE     ?? 'https://www.pramodrajput.co.in/og-image.png';
const FAVICON_URL  = process.env.NEXT_PUBLIC_FAVICON_URL  ?? '/favicon.png';

export const metadata: Metadata = {
  title:       `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESC,
  icons: {
    icon:       [
      { url: FAVICON_URL, sizes: '32x32',  type: 'image/png' },
      { url: FAVICON_URL, sizes: '192x192', type: 'image/png' },
    ],
    shortcut:   FAVICON_URL,
    apple:      [{ url: FAVICON_URL, sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title:       `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESC,
    images:      [{ url: OG_IMAGE, width: 720, height: 900, alt: SITE_NAME }],
    siteName:    SITE_NAME,
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESC,
    images:      [{ url: OG_IMAGE, alt: SITE_NAME }],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
