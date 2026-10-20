import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { LanguageProvider } from '@/lib/i18n';
import { SiteSettingsProvider } from '@/lib/site-settings-context';

export const metadata: Metadata = {
  title: {
    default: 'Pramod Rajput | Serving People, Building Tomorrow',
    template: '%s | Pramod Rajput',
  },
  description: 'Explore Pramod Rajput\'s public service journey, events, news, achievements, and community initiatives in Bhopal.',
  alternates: { canonical: '/' },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SiteSettingsProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main id="main-content" className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </SiteSettingsProvider>
    </LanguageProvider>
  );
}
