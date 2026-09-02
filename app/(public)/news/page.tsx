'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Newspaper } from 'lucide-react';
import type { News, NewsCategory } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import { NewsSearch } from './news-search';

export default function NewsPage() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/news').then(r => r.ok ? r.json() : []),
      fetch('/api/news/categories').then(r => r.ok ? r.json() : []),
    ]).then(([nw, cats]) => {
      setArticles(nw.status === 'fulfilled' ? nw.value : []);
      setCategories(cats.status === 'fulfilled' ? cats.value : []);
      setLoading(false);
    });
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="flex flex-col">
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('news', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('news', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('news', 'desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card h-56 sm:h-64 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="rounded-2xl border border-border bg-card h-56 animate-pulse" />)}
              </div>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link href={`/news/${featured.slug}`} className="group mb-8 sm:mb-12 grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-[16/10] sm:aspect-auto overflow-hidden bg-muted">
                    {featured.featured_image_url
                      ? <img src={featured.featured_image_url} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      : <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-12 w-12 text-muted-foreground" /></div>}
                  </div>
                  <div className="p-5 sm:p-8 flex flex-col justify-center">
                    {featured.news_categories && (
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{t('news', 'featured')} · {featured.news_categories.name}</span>
                    )}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">{featured.excerpt}</p>
                    {featured.published_at && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{formatDate(featured.published_at, lang)}</span>
                    )}
                  </div>
                </Link>
              )}

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <NewsSearch placeholder={t('news', 'search')} />
                <div className="flex flex-wrap gap-2">
                  <Link href="/news" className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium">{t('news', 'all')}</Link>
                  {categories.map(cat => (
                    <Link key={cat.id} href={`/news?category=${cat.slug}`} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">{cat.name}</Link>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {rest.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {rest.map((article, i) => (
                    <Link key={article.id} href={`/news/${article.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {article.featured_image_url
                          ? <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          : <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-10 w-10 text-muted-foreground" /></div>}
                      </div>
                      <div className="p-4 sm:p-6">
                        {article.news_categories && <span className="text-xs font-semibold text-primary uppercase tracking-wider">{article.news_categories.name}</span>}
                        <h3 className="text-sm sm:text-base font-bold mt-1.5 mb-1.5 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                        {article.published_at && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(article.published_at, lang)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : articles.length === 0 && (
                <div className="text-center py-14 text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">{t('news', 'noNews')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
