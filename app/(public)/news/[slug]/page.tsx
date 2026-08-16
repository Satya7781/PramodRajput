import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, ArrowRight, Newspaper } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { News } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';

async function getArticle(slug: string) {
  const { data } = await supabase
    .from('news')
    .select('*, news_categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return data as News | null;
}

async function getRelatedArticles(article: News) {
  const { data } = await supabase
    .from('news')
    .select('*, news_categories(*)')
    .eq('status', 'published')
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(3);
  return (data || []) as News[];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: `${article.title} — Pramod Rajput`,
    description: article.excerpt || article.title,
    openGraph: article.featured_image_url ? { images: [{ url: article.featured_image_url }] } : undefined,
  };
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          {article.featured_image_url ? (
            <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex items-end pb-12">
          <div className="max-w-3xl animate-slide-up">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>
            {article.news_categories && (
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3 block">
                {article.news_categories.name}
              </span>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-balance">{article.title}</h1>
            {article.published_at && (
              <span className="flex items-center gap-1.5 text-white/70 text-sm">
                <Calendar className="h-4 w-4" />
                {formatDate(article.published_at)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Article content */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            {article.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 font-medium border-l-4 border-primary pl-4">
                {article.excerpt}
              </p>
            )}
            <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel, i) => (
                <Link
                  key={rel.id}
                  href={`/news/${rel.slug}`}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {rel.featured_image_url ? (
                      <img
                        src={rel.featured_image_url}
                        alt={rel.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Newspaper className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {rel.news_categories && (
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {rel.news_categories.name}
                      </span>
                    )}
                    <h3 className="font-bold mt-1.5 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {rel.published_at ? formatDate(rel.published_at) : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
