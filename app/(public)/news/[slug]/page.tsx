'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Newspaper, Loader2 } from 'lucide-react';
import type { News } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

export default function NewsArticlePage() {
  const params = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [article, setArticle] = useState<News | null>(null);
  const [related, setRelated] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    let foundId: string | null = null;
    fetch(`/api/news?slug=${encodeURIComponent(params.slug)}`)
      .then(r => r.ok ? r.json() : [])
      .then((arr: News[]) => {
        const found = arr[0] ?? null;
        if (!found) { setNotFound(true); setLoading(false); return; }
        foundId = found.id;
        setArticle(found);
        return fetch(`/api/news?limit=6`).then(r => r.ok ? r.json() : []);
      })
      .then((all: News[] | undefined) => {
        if (all && foundId) setRelated(all.filter(a => a.id !== foundId).slice(0, 3));
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params?.slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFound || !article) return (
    <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('news','notFound')}</h1>
        <Link href="/news" className="text-primary underline text-sm">{t('news','backToNews')}</Link>
      </div>
    </div>
  );

  // bilingual content fields
  const title   = (lang === 'en' && (article as any).title_en)   ? (article as any).title_en   : article.title;
  const excerpt = (lang === 'en' && (article as any).excerpt_en) ? (article as any).excerpt_en : article.excerpt;
  const content = (lang === 'en' && (article as any).content_en) ? (article as any).content_en : article.content;

  return (
    <div className="flex flex-col">
      <section className="relative h-56 sm:h-[380px] lg:h-[420px] overflow-hidden">
        <div className="absolute inset-0">
          {article.featured_image_url
            ? <img src={article.featured_image_url} alt={title} className="h-full w-full object-cover" />
            : <div className="h-full w-full bg-secondary/20" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex items-end pb-8 sm:pb-12">
          <div className="max-w-3xl animate-slide-up">
            <Link href="/news" className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors mb-3 sm:mb-4">
              <ArrowLeft className="h-4 w-4" /> {t('news','backToNews')}
            </Link>
            {article.news_categories && (
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2">{article.news_categories.name}</span>
            )}
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 text-balance">{title}</h1>
            {article.published_at && (
              <span className="flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
                <Calendar className="h-4 w-4" />{formatDate(article.published_at, lang)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            {excerpt && (
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 font-medium border-l-4 border-primary pl-4">{excerpt}</p>
            )}
            <div className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{content}</div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">{t('news','related')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {related.map((rel, i) => {
                const relTitle = (lang === 'en' && (rel as any).title_en) ? (rel as any).title_en : rel.title;
                return (
                  <Link key={rel.id} href={`/news/${rel.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {rel.featured_image_url
                        ? <img src={rel.featured_image_url} alt={relTitle} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        : <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-10 w-10 text-muted-foreground" /></div>}
                    </div>
                    <div className="p-4 sm:p-5">
                      {rel.news_categories && <span className="text-xs font-semibold text-primary uppercase tracking-wider">{rel.news_categories.name}</span>}
                      <h3 className="text-sm font-bold mt-1.5 mb-1.5 group-hover:text-primary transition-colors line-clamp-2">{relTitle}</h3>
                      {rel.published_at && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(rel.published_at, lang)}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
