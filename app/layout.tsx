import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

// These can be overridden via NEXT_PUBLIC_ env vars so the site
// can be rebranded without code changes.
const SITE_NAME    = process.env.NEXT_PUBLIC_SITE_NAME    ?? 'Pramod Rajput';
const SITE_TAGLINE = process.env.NEXT_PUBLIC_SITE_TAGLINE ?? 'Serving People, Building Tomorrow';
const SITE_DESC    = process.env.NEXT_PUBLIC_SITE_DESC    ?? `Official digital platform of ${SITE_NAME} — public servant, community leader, and advocate for grassroots development.`;
const OG_IMAGE     = process.env.NEXT_PUBLIC_OG_IMAGE     ?? 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200';

export const metadata: Metadata = {
  title:       `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESC,
  openGraph: {
    title:       `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESC,
    images:      [{ url: OG_IMAGE }],
  },
  twitter: {
    card:   'summary_large_image',
    images: [{ url: OG_IMAGE }],
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
