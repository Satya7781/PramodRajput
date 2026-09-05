'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Calendar, MapPin, Users, Award,
  Newspaper, ImageIcon, Video as VideoIcon,
  Trophy, Heart, Target, TrendingUp,
} from 'lucide-react';
import type { Event, News, PhotoAlbum, Video } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [events, setEvents]   = useState<Event[]>([]);
  const [news, setNews]       = useState<News[]>([]);
  const [albums, setAlbums]   = useState<PhotoAlbum[]>([]);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/events?limit=3').then(r => r.ok ? r.json() : []),
      fetch('/api/news?limit=3').then(r => r.ok ? r.json() : []),
      fetch('/api/albums?limit=4').then(r => r.ok ? r.json() : []),
    ]).then(([ev, nw, al]) => {
      setEvents(ev.status === 'fulfilled' ? ev.value : []);
      setNews(nw.status === 'fulfilled' ? nw.value : []);
      setAlbums(al.status === 'fulfilled' ? al.value : []);
      setReady(true);
    });
  }, []);

  const statItems = [
    { value: '13+', label: t('common', 'yearsOfService') },
    { value: '9+',  label: t('common', 'events_count') },
    { value: '11+', label: t('common', 'kaviCount') },
    { value: '5,000+', label: t('common', 'studentCount') },
  ];

  const values = [
    { icon: Target, title: t('home', 'val1Title'), desc: t('home', 'val1Desc') },
    { icon: Heart,  title: t('home', 'val2Title'), desc: t('home', 'val2Desc') },
    { icon: Trophy, title: t('home', 'val3Title'), desc: t('home', 'val3Desc') },
  ];

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/15470221/pexels-photo-15470221.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Pramod Rajput addressing a public gathering"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 py-16 sm:py-20">
          <div className="max-w-xl sm:max-w-2xl animate-slide-up">
            <span className="inline-block rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 px-4 py-1.5 text-xs sm:text-sm font-medium text-white mb-4 sm:mb-6">
              {t('home', 'heroTag')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white tracking-tight text-balance mb-4 sm:mb-6">
              {t('home', 'heroTitle')}
            </h1>
            <p className="text-sm sm:text-lg text-white/80 leading-relaxed mb-6 sm:mb-8 max-w-xl">
              {t('home', 'heroDesc')}
            </p>
            <div className="flex flex-col xs:flex-row flex-wrap gap-3">
              <Link href="/about" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 sm:px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95">
                {t('home', 'heroBtn1')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/events" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-5 sm:px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all active:scale-95">
                <Calendar className="h-4 w-4" /> {t('home', 'heroBtn2')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Community gathering" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-3 sm:-bottom-6 sm:-right-6 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-lg hidden sm:block">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">13+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common', 'yearsOfService')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('home', 'introTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('home', 'introTitle')}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">{t('home', 'introDesc1')}</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">{t('home', 'introDesc2')}</p>
              <Link href="/about" className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base hover:gap-3 transition-all">
                {t('home', 'introLink')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 sm:py-16 bg-secondary/5 border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {statItems.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('home', 'valuesTag')}</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 mb-3 sm:mb-4 text-balance">{t('home', 'valuesTitle')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t('home', 'valuesDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {values.map((item, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-card p-6 sm:p-8 hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-5 sm:mb-6">
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('home', 'eventsTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">{t('home', 'eventsTitle')}</h2>
            </div>
            <Link href="/events" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0">
              {t('common', 'viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {!ready ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-64 animate-pulse" />)}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event, i) => (
                <Link key={event.id} href={`/events/${event.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {event.banner_url
                      ? <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="h-full w-full flex items-center justify-center bg-muted"><Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" /></div>}
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mb-2 sm:mb-3">
                      {event.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.start_date, lang)}</span>}
                      {event.venue && <span className="flex items-center gap-1 truncate max-w-[120px]"><MapPin className="h-3 w-3 shrink-0" />{event.venue}</span>}
                    </div>
                    <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{event.short_description}</p>
                    {event.status === 'registration_open' && (
                      <span className="inline-block mt-3 sm:mt-4 rounded-full bg-secondary/10 text-secondary px-3 py-0.5 text-xs font-medium">{t('home', 'registrationOpen')}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">{t('home', 'noEvents')}</p>
          )}
          <div className="mt-6 sm:hidden text-center">
            <Link href="/events" className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
              {t('common', 'viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('home', 'newsTag')}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">{t('home', 'newsTitle')}</h2>
            </div>
            <Link href="/news" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0">
              {t('common', 'allNews')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {!ready ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-64 animate-pulse" />)}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {news.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {article.featured_image_url
                      ? <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" /></div>}
                  </div>
                  <div className="p-4 sm:p-6">
                    {article.news_categories && (
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">{article.news_categories.name}</span>
                    )}
                    <h3 className="text-sm sm:text-lg font-bold mt-1.5 mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">{t('home', 'noNews')}</p>
          )}
          <div className="mt-6 sm:hidden text-center">
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
              {t('common', 'allNews')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('home', 'galleryTag')}</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 mb-3 sm:mb-4 text-balance">{t('home', 'galleryTitle')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t('home', 'galleryDesc')}</p>
          </div>
          {albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {albums.map((album) => (
                <Link key={album.id} href="/gallery/photos" className="group relative aspect-square rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  {album.cover_image_url
                    ? <img src={album.cover_image_url} alt={album.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    : <div className="h-full w-full flex items-center justify-center bg-muted"><ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-2">{album.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-sm text-muted-foreground">{t('home', 'noAlbums')}</p>
          )}
          <div className="flex flex-col xs:flex-row justify-center gap-3 mt-6 sm:mt-8">
            <Link href="/gallery/photos" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 sm:px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors">
              <ImageIcon className="h-4 w-4" /> {t('common', 'viewPhotos')}
            </Link>
            <Link href="/gallery/videos" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 sm:px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors">
              <VideoIcon className="h-4 w-4" /> {t('common', 'watchVideos')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social CTA ── */}
      <section className="py-14 sm:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-balance">{t('common', 'stayConnected')}</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">{t('common', 'followSocial')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://www.facebook.com/pramodrajput.rajput.9/" target="_blank" rel="noopener noreferrer"
              className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold hover:bg-white/20 transition-all active:scale-95">
              Facebook
            </a>
            <a href="https://x.com/pramodrajput07" target="_blank" rel="noopener noreferrer"
              className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold hover:bg-white/20 transition-all active:scale-95">
              Twitter / X
            </a>
            <a href="https://www.instagram.com/pramodrajput0214/?hl=en" target="_blank" rel="noopener noreferrer"
              className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold hover:bg-white/20 transition-all active:scale-95">
              Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
