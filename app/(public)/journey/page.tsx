'use client';

import { Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const MILESTONE_IMAGES = [
  'https://images.pexels.com/photos/11461856/pexels-photo-11461856.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/15470221/pexels-photo-15470221.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const MILESTONE_YEARS = ['2009','2012','2014','2015','2018','2019','2021','2023','2024','2025'];

export default function JourneyPage() {
  const { t } = useLanguage();

  const milestones = [
    { year: MILESTONE_YEARS[0], title: t('journey','m1t'), description: t('journey','m1d'), image: MILESTONE_IMAGES[0] },
    { year: MILESTONE_YEARS[1], title: t('journey','m2t'), description: t('journey','m2d'), image: MILESTONE_IMAGES[1] },
    { year: MILESTONE_YEARS[2], title: t('journey','m3t'), description: t('journey','m3d'), image: MILESTONE_IMAGES[2] },
    { year: MILESTONE_YEARS[3], title: t('journey','m4t'), description: t('journey','m4d'), image: MILESTONE_IMAGES[3] },
    { year: MILESTONE_YEARS[4], title: t('journey','m5t'), description: t('journey','m5d'), image: MILESTONE_IMAGES[4] },
    { year: MILESTONE_YEARS[5], title: t('journey','m6t'), description: t('journey','m6d'), image: MILESTONE_IMAGES[5] },
    { year: MILESTONE_YEARS[6], title: t('journey','m7t'), description: t('journey','m7d'), image: MILESTONE_IMAGES[6] },
    { year: MILESTONE_YEARS[7], title: t('journey','m8t'), description: t('journey','m8d'), image: MILESTONE_IMAGES[7] },
    { year: MILESTONE_YEARS[8], title: t('journey','m9t'), description: t('journey','m9d'), image: MILESTONE_IMAGES[8] },
    { year: MILESTONE_YEARS[9], title: t('journey','m10t'),description: t('journey','m10d'),image: MILESTONE_IMAGES[9] },
  ];

  return (
    <div className="flex flex-col">
      <section className="py-16 sm:py-24 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('journey','tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('journey','title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('journey','desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Mobile — vertical stack */}
          <div className="lg:hidden relative space-y-0">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            {milestones.map((m, i) => (
              <div key={i} className="relative flex gap-4 pb-8 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="relative z-10 shrink-0 flex flex-col items-center pt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border-2 border-background shadow">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold mb-2">
                    <Calendar className="h-3 w-3" />{m.year}
                  </span>
                  <h3 className="font-bold mb-1.5 text-sm sm:text-base leading-snug">{m.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">{m.description}</p>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border">
                    <img src={m.image} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop — alternating timeline */}
          <div className="hidden lg:block relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
            {milestones.map((m, i) => (
              <div key={i} className={`relative flex gap-6 mb-12 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} animate-slide-up`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="absolute left-1/2 top-6 -translate-x-1/2 z-10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border-4 border-background shadow">
                    {i + 1}
                  </div>
                </div>
                <div className="w-1/2 pr-10">
                  {i % 2 === 0 ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                        <Calendar className="h-3 w-3" />{m.year}
                      </span>
                      <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                    </div>
                  ) : (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-md">
                      <img src={m.image} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                </div>
                <div className="w-1/2 pl-10">
                  {i % 2 === 0 ? (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-md">
                      <img src={m.image} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                        <Calendar className="h-3 w-3" />{m.year}
                      </span>
                      <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
