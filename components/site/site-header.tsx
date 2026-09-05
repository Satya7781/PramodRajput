'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/site-settings-context';

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { settings } = useSiteSettings();

  const siteName = settings.site_name ?? 'Pramod Rajput';
  const initials = siteName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navLinks = [
    { href: '/',            labelKey: 'home' },
    { href: '/about',       labelKey: 'about' },
    { href: '/journey',     labelKey: 'journey' },
    { href: '/events',      labelKey: 'events' },
    { href: '/news',        labelKey: 'news' },
    { href: '/contact',     labelKey: 'contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const toggleLang = () => setLang(lang === 'hi' ? 'en' : 'hi');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base sm:text-lg">
            {initials}
          </div>
          <div className="hidden sm:block">
            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
              {siteName}
            </span>
            <span className="block text-[10px] sm:text-xs text-muted-foreground leading-none mt-0.5">
              {t('home', 'heroTag')}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-2.5 xl:px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                isActive(link.href) ? 'text-primary' : 'text-foreground'
              )}
            >
              {t('nav', link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right side: lang toggle + hamburger */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            aria-label={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Languages className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline">{lang === 'hi' ? 'EN' : 'हिं'}</span>
            <span className="xs:hidden">{lang === 'hi' ? 'EN' : 'हिं'}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                  isActive(link.href) ? 'text-primary bg-primary/5' : 'text-foreground'
                )}
              >
                {t('nav', link.labelKey)}
              </Link>
            ))}

            {/* Lang toggle in mobile menu too */}
            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={() => { toggleLang(); setMobileOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Languages className="h-4 w-4" />
                {lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
