import Link from 'next/link';
import { Calendar, Newspaper } from 'lucide-react';
import type { News, NewsCategory } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { NewsSearch } from './news-search';

export const metadata = {
  title: 'News — Pramod Rajput',
  description: 'Latest news, announcements, and updates from Pramod Rajput and community initiatives.',
};

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getNewsData() {
  const [newsRes, catRes] = await Promise.allSettled([
    fetch(`${BASE}/api/news`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/news/categories`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
  ]);
  return {
    news: (newsRes.status === 'fulfilled' ? newsRes.value : []) as News[],
    categories: (catRes.status === 'fulfilled' ? catRes.value : []) as NewsCategory[],
  };
}

export default async function NewsPage() {
  const { news, categories } = await getNewsData();
  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">News</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">Latest News & Updates</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">Stay informed about the latest initiatives, events, and community stories.</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {featured && (
            <Link href={`/news/${featured.slug}`} className="group mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all">
              <div className="aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted">
                {featured.featured_image_url ? (
                  <img src={featured.featured_image_url} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-16 w-16 text-muted-foreground" /></div>
                )}
              </div>
              <div className="p-8 flex flex-col justify-center">
                {featured.news_categories && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Featured · {featured.news_categories.name}</span>
                )}
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                {featured.published_at && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{formatDate(featured.published_at)}</span>
                )}
              </div>
            </Link>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <NewsSearch />
            <div className="flex flex-wrap gap-2">
              <Link href="/news" className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium">All</Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/news?category=${cat.slug}`} className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">{cat.name}</Link>
              ))}
            </div>
          </div>

          {rest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((article, i) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {article.featured_image_url ? (
                      <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-12 w-12 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="p-6">
                    {article.news_categories && <span className="text-xs font-semibold text-primary uppercase tracking-wider">{article.news_categories.name}</span>}
                    <h3 className="text-lg font-bold mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                    {article.published_at && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(article.published_at)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">{news.length === 0 ? 'No news articles published yet.' : null}</div>
          )}
        </div>
      </section>
    </div>
  );
}
