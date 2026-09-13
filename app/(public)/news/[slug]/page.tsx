'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Newspaper, Loader2, Play, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { News } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';

interface NewsMedia { id: string; media_type: 'photo'|'video'|'link'; url: string; caption: string|null; }

function getVideoEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt[1]}` };
  if (/facebook\.com|fb\.watch/.test(url)) return { type: 'facebook', url };
  return { type: 'other', url };
}

export default function NewsArticlePage() {
  const params = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [article, setArticle]   = useState<News | null>(null);
  const [related, setRelated]   = useState<News[]>([]);
  const [media, setMedia]       = useState<NewsMedia[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  useEffect(() => {
    if (!params?.slug) return;

    async function load() {
      try {
        const res = await fetch(`/api/news?slug=${encodeURIComponent(params.slug)}`);
        const arr: News[] = res.ok ? await res.json() : [];
        const found = Array.isArray(arr) ? (arr[0] ?? null) : null;

        if (!found) { setNotFound(true); setLoading(false); return; }

        setArticle(found);

        const [mediaRes, allRes] = await Promise.all([
          fetch(`/api/news/${found.id}/media`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/news?limit=6`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]);

        setMedia(Array.isArray(mediaRes) ? mediaRes : []);
        setRelated(Array.isArray(allRes) ? (allRes as News[]).filter(a => a.id !== found.id).slice(0, 3) : []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params?.slug]);

  const photos = media.filter(m => m.media_type === 'photo');
  const videos = media.filter(m => m.media_type === 'video');
  const links  = media.filter(m => m.media_type === 'link');

  useEffect(() => {
    if (!lightbox.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox(l => ({ ...l, index: Math.min(l.index + 1, photos.length - 1) }));
      if (e.key === 'ArrowLeft')  setLightbox(l => ({ ...l, index: Math.max(l.index - 1, 0) }));
      if (e.key === 'Escape')     setLightbox({ open: false, index: 0 });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox.open, photos.length]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (notFound || !article) return (
    <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('news','notFound')}</h1>
        <Link href="/news" className="text-primary underline text-sm">{t('news','backToNews')}</Link>
      </div>
    </div>
  );

  const title   = (lang === 'en' && (article as any).title_en)   ? (article as any).title_en   : article.title;
  const excerpt = (lang === 'en' && (article as any).excerpt_en) ? (article as any).excerpt_en : article.excerpt;
  const content = (lang === 'en' && (article as any).content_en) ? (article as any).content_en : article.content;

  return (
    <div className="flex flex-col">
      {/* Hero */}
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
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-10">

          {/* Article text */}
          <div className="max-w-3xl">
            {excerpt && <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 font-medium border-l-4 border-primary pl-4">{excerpt}</p>}
            <div className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{content}</div>
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {lang === 'hi' ? 'फ़ोटो' : 'Photos'} ({photos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setLightbox({ open: true, index: i })}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all">
                    <img src={p.url} alt={p.caption ?? ''} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    {p.caption && <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-1.5 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{p.caption}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                {lang === 'hi' ? 'वीडियो' : 'Videos'} ({videos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((v, i) => {
                  const embed = getVideoEmbed(v.url);
                  return (
                    <div key={v.id} className="rounded-xl border border-border overflow-hidden bg-card">
                      {embed.type === 'youtube' && (
                        <div className="aspect-video">
                          <iframe src={embed.embedUrl} title={v.caption ?? `Video ${i+1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen className="h-full w-full" />
                        </div>
                      )}
                      {embed.type === 'facebook' && (
                        <div className="aspect-video flex items-center justify-center bg-blue-50">
                          <iframe
                            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v.url)}&show_text=false&width=560`}
                            width="560" height="315" scrolling="no" className="w-full max-w-full"
                            allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          />
                        </div>
                      )}
                      {embed.type === 'other' && (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <a href={v.url} target="_blank" rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <Play className="h-10 w-10" />
                            <span className="text-xs">{lang === 'hi' ? 'वीडियो देखें' : 'Watch Video'}</span>
                          </a>
                        </div>
                      )}
                      {v.caption && <div className="px-4 py-2 text-sm text-muted-foreground">{v.caption}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-3">{lang === 'hi' ? 'संबंधित लिंक' : 'Related Links'}</h2>
              <div className="space-y-2">
                {links.map(l => (
                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-primary hover:bg-muted transition-colors">
                    <ArrowLeft className="h-4 w-4 rotate-180 shrink-0" />
                    {l.caption || l.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related */}
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

      {/* Lightbox */}
      {lightbox.open && photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4" onClick={() => setLightbox({ open: false, index: 0 })}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2" onClick={() => setLightbox({ open: false, index: 0 })}><X className="h-6 w-6" /></button>
          {lightbox.index > 0 && (
            <button className="absolute left-3 sm:left-6 text-white/80 hover:text-white bg-black/50 rounded-full p-2" onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index - 1 })); }}><ChevronLeft className="h-7 w-7" /></button>
          )}
          <img src={photos[lightbox.index].url} alt={photos[lightbox.index].caption ?? ''} className="max-h-[88vh] max-w-[88vw] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          {lightbox.index < photos.length - 1 && (
            <button className="absolute right-3 sm:right-6 text-white/80 hover:text-white bg-black/50 rounded-full p-2" onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index + 1 })); }}><ChevronRight className="h-7 w-7" /></button>
          )}
          <div className="absolute bottom-4 text-white/60 text-sm select-none">
            {lightbox.index + 1} / {photos.length}
            {photos[lightbox.index].caption && <span className="ml-3 text-white/80">{photos[lightbox.index].caption}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
