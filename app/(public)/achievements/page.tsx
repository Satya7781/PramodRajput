'use client';

import { Award, Trophy, Medal, Star, BookOpen, Music, Heart, Dumbbell } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const ACHIEVEMENT_ICONS = [BookOpen, Trophy, Dumbbell, Medal, Trophy, Star, Music, Award, Heart];
const ACHIEVEMENT_IMAGES = [
  'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/15470221/pexels-photo-15470221.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function AchievementsPage() {
  const { t } = useLanguage();

  const achievements = [
    { title: t('achievements','a1t'), year: t('achievements','a1y'), description: t('achievements','a1d'), image: ACHIEVEMENT_IMAGES[0], icon: ACHIEVEMENT_ICONS[0] },
    { title: t('achievements','a2t'), year: t('achievements','a2y'), description: t('achievements','a2d'), image: ACHIEVEMENT_IMAGES[1], icon: ACHIEVEMENT_ICONS[1] },
    { title: t('achievements','a3t'), year: t('achievements','a3y'), description: t('achievements','a3d'), image: ACHIEVEMENT_IMAGES[2], icon: ACHIEVEMENT_ICONS[2] },
    { title: t('achievements','a4t'), year: t('achievements','a4y'), description: t('achievements','a4d'), image: ACHIEVEMENT_IMAGES[3], icon: ACHIEVEMENT_ICONS[3] },
    { title: t('achievements','a5t'), year: t('achievements','a5y'), description: t('achievements','a5d'), image: ACHIEVEMENT_IMAGES[4], icon: ACHIEVEMENT_ICONS[4] },
    { title: t('achievements','a6t'), year: t('achievements','a6y'), description: t('achievements','a6d'), image: ACHIEVEMENT_IMAGES[5], icon: ACHIEVEMENT_ICONS[5] },
    { title: t('achievements','a7t'), year: t('achievements','a7y'), description: t('achievements','a7d'), image: ACHIEVEMENT_IMAGES[6], icon: ACHIEVEMENT_ICONS[6] },
    { title: t('achievements','a8t'), year: t('achievements','a8y'), description: t('achievements','a8d'), image: ACHIEVEMENT_IMAGES[7], icon: ACHIEVEMENT_ICONS[7] },
    { title: t('achievements','a9t'), year: t('achievements','a9y'), description: t('achievements','a9d'), image: ACHIEVEMENT_IMAGES[8], icon: ACHIEVEMENT_ICONS[8] },
  ];

  return (
    <div className="flex flex-col">
      <section className="py-16 sm:py-24 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('achievements','tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('achievements','title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('achievements','desc')}</p>
          </div>
        </div>
      </section>
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {achievements.map((item, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-muted">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">{item.year}</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-snug">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
