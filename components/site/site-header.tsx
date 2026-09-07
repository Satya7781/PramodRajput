'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Languages, Home, Info, MapPin, CalendarDays, Newspaper, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/site-settings-context';

const NAV_ICONS: Record<string, React.ElementType> = {
  home: Home, about: Info, journey: MapPin,
  events: CalendarDays, news: Newspaper, contact: Phone,
};

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { settings } = useSiteSettings();

  const siteName = settings.site_name ?? 'Pramod Rajput';
  const initials = siteName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const navLinks = [
    { href: '/',        labelKey: 'home' },
    { href: '/about',   labelKey: 'about' },
    { href: '/journey', labelKey: 'journey' },
    { href: '/events',  labelKey: 'events' },
    { href: '/news',    labelKey: 'news' },
    { href: '/contact', labelKey: 'contact' },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const toggleLang = () => setLang(lang === 'hi' ? 'en' : 'hi');

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md transition-shadow duration-200',
        scrolled ? 'shadow-md border-border' : 'border-border/60'
      )}>
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Home">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm sm:text-base shadow-sm group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="hidden sm:block leading-none">
              <span className="text-sm sm:text-base font-bold tracking-tight text-foreground">{siteName}</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5 font-medium">
                {lang === 'hi' ? 'जनसेवक | भोपाल' : 'Public Servant · Bhopal'}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                  isActive(link.href) ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                )}
              >
                {t('nav', link.labelKey)}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              aria-label={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold hover:bg-muted active:scale-95 transition-all"
            >
              <Languages className="h-3.5 w-3.5 shrink-0" />
              <span>{lang === 'hi' ? 'EN' : 'हिं'}</span>
            </button>

            {/* Hamburger */}
            <button
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40 hover:bg-muted active:scale-95 transition-all"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-card border-l border-border shadow-2xl lg:hidden',
        'flex flex-col transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              {initials}
            </div>
            <span className="font-bold text-sm">{siteName}</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => {
            const Icon = NAV_ICONS[link.labelKey];
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                {t('nav', link.labelKey)}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Language toggle in drawer */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => { toggleLang(); setMobileOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Languages className="h-4.5 w-4.5 shrink-0" />
            {lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          </button>
        </div>
      </div>
    </>
  );
}
