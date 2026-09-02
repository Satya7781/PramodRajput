'use client';

import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { ContactForm } from './contact-form';
import { useLanguage } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/site-settings-context';

export default function ContactPage() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const email    = settings.contact_email            ?? '';
  const phone    = settings.contact_phone            ?? '';
  const phoneAlt = settings.contact_phone_secondary  ?? '';
  const address  = settings.contact_address          ?? '';
  const fbUrl    = settings.facebook  ?? '';
  const twUrl    = settings.twitter   ?? '';
  const igUrl    = settings.instagram ?? '';
  const ytUrl    = settings.youtube   ?? '';

  // Build contact info rows — only show rows that have data
  const contactItems = [
    email    && { icon: Mail,  label: t('contact', 'emailLabel'),   value: email,    href: `mailto:${email}` },
    phone    && { icon: Phone, label: t('contact', 'phoneLabel'),   value: phone,    href: `tel:${phone.replace(/\s/g, '')}` },
    phoneAlt && { icon: Phone, label: t('contact', 'phoneLabel'),   value: phoneAlt, href: `tel:${phoneAlt.replace(/\s/g, '')}` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href: string }[];

  const socialItems = [
    fbUrl && { icon: Facebook, label: 'Facebook', href: fbUrl },
    twUrl && { icon: Twitter,  label: 'Twitter',  href: twUrl },
    igUrl && { icon: Instagram,label: 'Instagram',href: igUrl },
    ytUrl && { icon: Youtube,  label: 'YouTube',  href: ytUrl },
  ].filter(Boolean) as { icon: React.ElementType; label: string; href: string }[];

  return (
    <div className="flex flex-col">
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('contact', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('contact', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('contact', 'desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">

            {/* Info */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">{t('contact', 'infoTitle')}</h2>
                <div className="space-y-4 sm:space-y-5">
                  {contactItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                        <a href={item.href} className="font-medium text-sm sm:text-base hover:text-primary transition-colors">
                          {item.value}
                        </a>
                      </div>
                    </div>
                  ))}
                  {address && (
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{t('contact', 'addressLabel')}</p>
                        <p className="font-medium text-sm sm:text-base">{address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social */}
              {socialItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t('contact', 'socialTitle')}</h3>
                  <div className="flex items-center gap-3">
                    {socialItems.map((s, i) => (
                      <a
                        key={i}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                        aria-label={s.label}
                      >
                        <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Office hours */}
              <div className="rounded-2xl bg-secondary/5 border border-border p-5 sm:p-6">
                <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{t('contact', 'officeHours')}</h3>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>{t('contact', 'monFri')}</p>
                  <p>{t('contact', 'sat')}</p>
                  <p>{t('contact', 'sun')}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6">{t('contact', 'formTitle')}</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
