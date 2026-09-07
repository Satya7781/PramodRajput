'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Newspaper, ArrowRight, Search, X } from 'lucide-react';
import type { News, NewsCategory } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="h-2.5 w-16 bg-muted animate-pulse rounded-full" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { lang, t } = useLanguage();
  const [articles, setArticles]   = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/news').then(r => r.ok ? r.json() : []),
      fetch('/api/news/categories').then(r => r.ok ? r.json() : []),
    ]).then(([nw, cats]) => {
      setArticles(nw.status === 'fulfilled' && Array.isArray(nw.value) ? nw.value : []);
      setCategories(cats.status === 'fulfilled' && Array.isArray(cats.value) ? cats.value : []);
      setLoading(false);
    });
  }, []);

  const filtered = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.excerpt ?? '').toLowerCase().includes(q);
    const matchCat = activeCategory === 'all' || a.news_categories?.slug === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = filtered[0];
  const rest     = filtered.slice(1);

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('news', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3 mb-4 text-balance leading-tight">
              {t('news', 'title')}
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('news', 'desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('news', 'search')}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setActiveCategory('all')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {t('news', 'all')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="aspect-[16/10] bg-muted animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-20 bg-muted animate-pulse rounded-full" />
                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                    <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded mt-4" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[1,2,3].map(i => <CardSkeleton key={i} />)}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold mb-1">{t('news', 'noNews')}</p>
              {search && (
                <button onClick={() => setSearch('')} className="text-sm text-primary hover:underline mt-1">
                  {lang === 'hi' ? 'खोज साफ़ करें' : 'Clear search'}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link
                  href={`/news/${featured.slug}`}
                  className="group mb-8 sm:mb-10 grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200 animate-slide-up"
                >
                  <div className="aspect-[16/10] sm:aspect-auto overflow-hidden bg-muted">
                    {featured.featured_image_url
                      ? <img src={featured.featured_image_url} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      : <div className="h-full w-full flex items-center justify-center bg-muted min-h-[200px]"><Newspaper className="h-14 w-14 text-muted-foreground/30" /></div>}
                  </div>
                  <div className="p-5 sm:p-8 flex flex-col justify-center gap-3">
                    {featured.news_categories && (
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {t('news', 'featured')} · {featured.news_categories.name}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-black group-hover:text-primary transition-colors leading-snug line-clamp-3">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    {featured.published_at && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5" />{formatDate(featured.published_at, lang)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-1 group-hover:gap-2.5 transition-all">
                      {t('common', 'readMore')} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {rest.map((article, i) => (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}`}
                      className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {article.featured_image_url
                          ? <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          : <div className="h-full w-full flex items-center justify-center"><Newspaper className="h-10 w-10 text-muted-foreground/30" /></div>}
                      </div>
                      <div className="p-4 sm:p-5">
                        {article.news_categories && (
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{article.news_categories.name}</span>
                        )}
                        <h3 className="text-sm sm:text-base font-bold mt-1.5 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">{article.excerpt}</p>
                        {article.published_at && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />{formatDate(article.published_at, lang)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
