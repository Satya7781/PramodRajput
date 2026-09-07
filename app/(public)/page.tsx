'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Calendar, MapPin, Users,
  Newspaper, ImageIcon, Trophy, Heart, Target,
  Facebook, Twitter, Instagram,
} from 'lucide-react';
import type { Event, News } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews]     = useState<News[]>([]);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/events?limit=3').then(r => r.ok ? r.json() : []),
      fetch('/api/news?limit=3').then(r => r.ok ? r.json() : []),
    ]).then(([ev, nw]) => {
      setEvents(Array.isArray(ev.status === 'fulfilled' ? ev.value : []) ? (ev.status === 'fulfilled' ? ev.value : []) : []);
      setNews(Array.isArray(nw.status === 'fulfilled' ? nw.value : []) ? (nw.status === 'fulfilled' ? nw.value : []) : []);
      setReady(true);
    });
  }, []);

  const statItems = [
    { value: '13+',    label: t('common', 'yearsOfService'),  color: 'text-primary' },
    { value: '9+',     label: t('common', 'events_count'),    color: 'text-secondary' },
    { value: '11+',    label: t('common', 'kaviCount'),       color: 'text-accent' },
    { value: '5,000+', label: t('common', 'studentCount'),    color: 'text-primary' },
  ];

  const values = [
    { icon: Target, title: t('home', 'val1Title'), desc: t('home', 'val1Desc') },
    { icon: Heart,  title: t('home', 'val2Title'), desc: t('home', 'val2Desc') },
    { icon: Trophy, title: t('home', 'val3Title'), desc: t('home', 'val3Desc') },
  ];

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative min-h-[560px] sm:min-h-[640px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/tjbdnxlr/image/upload/f_auto,q_auto/v1788760473/site/hero-pramod-rajput.jpg"
            alt="Pramod Rajput addressing a public gathering"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
          {/* bottom fade for smooth section transition */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8 py-20 sm:py-24">
          <div className="max-w-xl sm:max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/25 backdrop-blur-sm border border-primary/30 px-4 py-1.5 text-xs sm:text-sm font-medium text-white mb-5 sm:mb-7 animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {t('home', 'heroTag')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance mb-5 sm:mb-7 animate-slide-up">
              {t('home', 'heroTitle')}
            </h1>
            <p className="text-sm sm:text-lg text-white/75 leading-relaxed mb-7 sm:mb-9 max-w-lg animate-slide-up" style={{ animationDelay: '80ms' }}>
              {t('home', 'heroDesc')}
            </p>
            <div className="flex flex-col xs:flex-row flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '160ms' }}>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 active:scale-95 transition-all"
              >
                {t('home', 'heroBtn1')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                <Calendar className="h-4 w-4" /> {t('home', 'heroBtn2')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {statItems.map((stat, i) => (
              <div key={i} className="text-center group">
                <p className={`text-3xl sm:text-4xl font-black ${stat.color} tabular-nums leading-none mb-1`}>{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Community gathering"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-2 sm:-bottom-6 sm:-right-4 bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-xl hidden sm:block">
                <p className="text-2xl sm:text-3xl font-black leading-none">13+</p>
                <p className="text-xs font-semibold opacity-80 mt-0.5">{t('common', 'yearsOfService')}</p>
              </div>
            </div>
            {/* Text */}
            <div className="order-1 lg:order-2">
              <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('home', 'introTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-3 mb-5 text-balance leading-snug">{t('home', 'introTitle')}</h2>
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t('home', 'introDesc1')}</p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t('home', 'introDesc2')}</p>
              </div>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm px-5 py-2.5 hover:bg-primary/15 active:scale-95 transition-all"
              >
                {t('home', 'introLink')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('home', 'valuesTag')}</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-3 mb-3 text-balance">{t('home', 'valuesTitle')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t('home', 'valuesDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {values.map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card p-6 sm:p-8 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-200"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary transition-colors duration-200 mb-5">
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('home', 'eventsTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-2">{t('home', 'eventsTitle')}</h2>
            </div>
            <Link href="/events" className="hidden sm:inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-2.5 transition-all shrink-0">
              {t('common', 'viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!ready ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="aspect-[16/10] bg-muted animate-pulse" />
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {events.map((event, i) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                    {event.banner_url
                      ? <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      : <div className="h-full w-full flex items-center justify-center"><Calendar className="h-10 w-10 text-muted-foreground/40" /></div>}
                    {event.status === 'registration_open' && (
                      <span className="absolute top-3 left-3 rounded-full bg-green-500 text-white px-2.5 py-0.5 text-xs font-semibold shadow-md">
                        {t('home', 'registrationOpen')}
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2.5">
                      {event.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.start_date, lang)}</span>}
                      {event.venue && <span className="flex items-center gap-1 truncate max-w-[130px]"><MapPin className="h-3 w-3 shrink-0" />{event.venue}</span>}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{event.title}</h3>
                    {event.short_description && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.short_description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 border border-dashed border-border rounded-2xl">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t('home', 'noEvents')}</p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/events" className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
              {t('common', 'viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('home', 'newsTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-2">{t('home', 'newsTitle')}</h2>
            </div>
            <Link href="/news" className="hidden sm:inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-2.5 transition-all shrink-0">
              {t('common', 'allNews')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!ready ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="aspect-[16/10] bg-muted animate-pulse" />
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {news.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {article.featured_image_url
                      ? <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      : <div className="h-full w-full flex items-center justify-center"><Newspaper className="h-10 w-10 text-muted-foreground/40" /></div>}
                  </div>
                  <div className="p-4 sm:p-5">
                    {article.news_categories && (
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{article.news_categories.name}</span>
                    )}
                    <h3 className="text-sm sm:text-base font-bold mt-1.5 mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{article.title}</h3>
                    {article.excerpt && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{article.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 border border-dashed border-border rounded-2xl">
              <Newspaper className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t('home', 'noNews')}</p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
              {t('common', 'allNews')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Events CTA ── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 sm:p-12 lg:p-16 text-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="relative z-10">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80 mb-3 block">{t('home', 'galleryTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 text-balance">{t('home', 'galleryTitle')}</h2>
              <p className="text-sm sm:text-base opacity-80 max-w-xl mx-auto mb-7">{t('home', 'galleryDesc')}</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold px-7 py-3.5 text-sm hover:bg-white/90 active:scale-95 transition-all shadow-lg"
              >
                <ImageIcon className="h-4 w-4" />
                {lang === 'hi' ? 'सभी कार्यक्रम देखें' : 'Browse All Events'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social CTA ── */}
      <section className="py-14 sm:py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t('common', 'stayConnected')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-7">{t('common', 'followSocial')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.facebook.com/pramodrajput.rajput.9/"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all shadow-sm"
            >
              <Facebook className="h-4 w-4" /> Facebook
            </a>
            <a
              href="https://x.com/pramodrajput07"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all shadow-sm"
            >
              <Twitter className="h-4 w-4" /> Twitter / X
            </a>
            <a
              href="https://www.instagram.com/pramodrajput0214/?hl=en"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all shadow-sm"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
