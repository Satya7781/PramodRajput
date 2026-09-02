import { ReactNode } from 'react';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { LanguageProvider } from '@/lib/i18n';
import { SiteSettingsProvider } from '@/lib/site-settings-context';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SiteSettingsProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </SiteSettingsProvider>
    </LanguageProvider>
  );
}
