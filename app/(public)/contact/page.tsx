'use client';

import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Clock } from 'lucide-react';
import { ContactForm } from './contact-form';
import { useLanguage } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/site-settings-context';

export default function ContactPage() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const email    = settings.contact_email           ?? '';
  const phone    = settings.contact_phone           ?? '';
  const phoneAlt = settings.contact_phone_secondary ?? '';
  const address  = settings.contact_address         ?? '';
  const fbUrl    = settings.facebook  ?? 'https://www.facebook.com/pramodrajput.rajput.9/';
  const twUrl    = settings.twitter   ?? 'https://x.com/pramodrajput07';
  const igUrl    = settings.instagram ?? 'https://www.instagram.com/pramodrajput0214/?hl=en';

  const contactItems = [
    email    && { icon: Mail,  label: t('contact', 'emailLabel'), value: email,    href: `mailto:${email}` },
    phone    && { icon: Phone, label: t('contact', 'phoneLabel'), value: phone,    href: `tel:${phone.replace(/\s/g, '')}` },
    phoneAlt && { icon: Phone, label: t('contact', 'phoneLabel'), value: phoneAlt, href: `tel:${phoneAlt.replace(/\s/g, '')}` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href: string }[];

  const socials = [
    { icon: Facebook,  label: 'Facebook',   href: fbUrl, color: 'hover:bg-blue-600 hover:border-blue-600' },
    { icon: Twitter,   label: 'Twitter / X', href: twUrl, color: 'hover:bg-sky-500 hover:border-sky-500' },
    { icon: Instagram, label: 'Instagram',   href: igUrl, color: 'hover:bg-pink-600 hover:border-pink-600' },
  ];

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('contact', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3 mb-4 text-balance leading-tight">{t('contact', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('contact', 'desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

            {/* ── Info column ── */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Contact items */}
              {contactItems.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-5">{t('contact', 'infoTitle')}</h2>
                  <div className="space-y-3">
                    {contactItems.map((item, i) => (
                      <a
                        key={i}
                        href={item.href}
                        className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-3.5 sm:p-4 hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary transition-colors shrink-0">
                          <item.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{item.label}</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{item.value}</p>
                        </div>
                      </a>
                    ))}
                    {address && (
                      <div className="flex items-start gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-3.5 sm:p-4">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0 mt-0.5">
                          <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">{t('contact', 'addressLabel')}</p>
                          <p className="font-medium text-sm sm:text-base leading-relaxed">{address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Office hours */}
              <div className="rounded-2xl bg-muted/50 border border-border p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  <h3 className="font-bold text-sm sm:text-base">{t('contact', 'officeHours')}</h3>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
                  <div className="flex justify-between">
                    <span>{t('contact', 'monFri').split(':')[0]}</span>
                    <span className="font-medium text-foreground">{t('contact', 'monFri').split(':')[1] ?? '10:00 – 18:00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contact', 'sat').split(':')[0]}</span>
                    <span className="font-medium text-foreground">{t('contact', 'sat').split(':')[1] ?? '10:00 – 14:00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contact', 'sun').split(':')[0]}</span>
                    <span className="font-medium text-foreground">{t('contact', 'sun').split(':')[1] ?? 'Closed'}</span>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div>
                <h3 className="font-bold text-sm sm:text-base mb-3">{t('contact', 'socialTitle')}</h3>
                <div className="flex items-center gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-primary-foreground active:scale-95 transition-all ${s.color}`}
                    >
                      <s.icon className="h-4.5 w-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Form column ── */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 lg:p-8 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-6">{t('contact', 'formTitle')}</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
