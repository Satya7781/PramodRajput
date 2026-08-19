import Link from 'next/link';
import { Calendar, MapPin, Camera, Video, ArrowRight, BookOpen } from 'lucide-react';
import type { EventMemory } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';

export const metadata = {
  title: 'Past Event Memories — Pramod Rajput',
  description:
    'Relive the journey — photos and stories from community events, social programmes, and public gatherings organised by Pramod Rajput.',
};

async function getMemories(): Promise<EventMemory[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/memories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function MemoriesPage() {
  const memories = await getMemories();

  // Group memories by year for a timeline feel
  const byYear: Record<string, EventMemory[]> = {};
  for (const m of memories) {
    const year = m.event_date ? new Date(m.event_date).getFullYear().toString() : 'Unknown';
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(m);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              Past Memories
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance leading-tight">
              A Journey of Service & Community
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From grassroots gatherings to large-scale public events — every moment
              documented here is a testament to the power of community. Browse through
              memories, photos, and stories from events organised over the years.
            </p>
            {memories.length > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {memories.length} event{memories.length !== 1 ? 's' : ''} documented
                across {years.length} year{years.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">

          {memories.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="text-xl font-semibold mb-2">No memories published yet</h2>
              <p className="text-muted-foreground text-sm">Check back soon for event highlights and stories.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {years.map(year => (
                <div key={year}>

                  {/* Year heading */}
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-black text-primary/20 select-none leading-none">
                      {year}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">
                      {byYear[year].length} event{byYear[year].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {byYear[year].map((memory, i) => (
                      <Link
                        key={memory.id}
                        href={`/memories/${memory.slug}`}
                        className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        {/* Cover */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          {memory.cover_image_url ? (
                            <img
                              src={memory.cover_image_url}
                              alt={memory.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <BookOpen className="h-14 w-14 text-muted-foreground opacity-20" />
                            </div>
                          )}
                          {/* Media counts badge */}
                          {((memory.photo_count ?? 0) > 0 || (memory.video_count ?? 0) > 0) && (
                            <div className="absolute bottom-2 right-2 flex gap-1.5">
                              {(memory.photo_count ?? 0) > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5">
                                  <Camera className="h-3 w-3" />
                                  {memory.photo_count}
                                </span>
                              )}
                              {(memory.video_count ?? 0) > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5">
                                  <Video className="h-3 w-3" />
                                  {memory.video_count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-5">
                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2.5">
                            {memory.event_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(memory.event_date)}
                              </span>
                            )}
                            {memory.location && (
                              <span className="flex items-center gap-1 truncate max-w-[140px]">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {memory.location}
                              </span>
                            )}
                          </div>

                          <h2 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {memory.title}
                          </h2>

                          {memory.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                              {memory.description}
                            </p>
                          )}

                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                            View Memory <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
