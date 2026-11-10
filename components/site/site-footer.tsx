'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/site-settings-context';

export function SiteFooter() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const siteName = settings.site_name      ?? 'Pramod Rajput';
  const email    = settings.contact_email  ?? '';
  const phone    = settings.contact_phone  ?? '';
  const phoneAlt = settings.contact_phone_secondary ?? '';
  const address  = settings.contact_address ?? '';
  const fbUrl    = settings.facebook  ?? 'https://www.facebook.com/pramodrajput.rajput.9/';
  const twUrl    = settings.twitter   ?? 'https://x.com/pramodrajput07';
  const igUrl    = settings.instagram ?? 'https://www.instagram.com/pramodrajput0214/?hl=en';

  const initials = siteName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group w-fit" aria-label={`${siteName} — Home`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <span className="text-base font-bold tracking-tight">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('footer', 'tagline')}</p>
            <div className="flex items-center gap-3 mt-4">
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={twUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Twitter / X">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('footer', 'quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about"        className="hover:text-primary transition-colors">{t('nav', 'about')}</Link></li>
              <li><Link href="/journey"      className="hover:text-primary transition-colors">{t('nav', 'journey')}</Link></li>
              <li><Link href="/achievements" className="hover:text-primary transition-colors">{t('nav', 'achievements')}</Link></li>
              <li><Link href="/memories"     className="hover:text-primary transition-colors">{t('nav', 'memories')}</Link></li>
              <li><Link href="/news"         className="hover:text-primary transition-colors">{t('nav', 'news')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('footer', 'resources')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/events"             className="hover:text-primary transition-colors">{t('nav', 'events')}</Link></li>
              <li><Link href="/certificate/verify" className="hover:text-primary transition-colors">{t('footer', 'verifyCert')}</Link></li>
              <li><Link href="/contact"            className="hover:text-primary transition-colors">{t('nav', 'contact')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('footer', 'connect')}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="break-all hover:text-primary transition-colors">{email}</a>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">{phone}</a>
                </li>
              )}
              {phoneAlt && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <a href={`tel:${phoneAlt.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">{phoneAlt}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border space-y-4">
          {/* Copyright row */}
          <div className="flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              All rights reserved by{' '}
              <a
                href="https://satyachouhan.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline transition-colors"
              >
                Satya Chouhan
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
