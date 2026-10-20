'use client';

import { Award, Trophy, Medal, Star, BookOpen, Music, Heart, Dumbbell, Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// Each achievement uses a themed icon instead of unrelated stock photos
const ACHIEVEMENT_ICONS = [
  BookOpen,  // GK Competition
  Trophy,    // Matki Phod
  Dumbbell,  // Night Cricket
  Medal,     // Marathon
  Trophy,    // Block Cricket
  Star,      // Dussehra
  Music,     // Kavi Sammelan
  Award,     // Bhagwat Katha
  Heart,     // Clothes Distribution
];

const ACHIEVEMENT_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
];

export default function AchievementsPage() {
  const { t } = useLanguage();

  const achievements = [
    { title: t('achievements','a1t'), year: t('achievements','a1y'), description: t('achievements','a1d'), icon: ACHIEVEMENT_ICONS[0], color: ACHIEVEMENT_COLORS[0] },
    { title: t('achievements','a2t'), year: t('achievements','a2y'), description: t('achievements','a2d'), icon: ACHIEVEMENT_ICONS[1], color: ACHIEVEMENT_COLORS[1] },
    { title: t('achievements','a3t'), year: t('achievements','a3y'), description: t('achievements','a3d'), icon: ACHIEVEMENT_ICONS[2], color: ACHIEVEMENT_COLORS[2] },
    { title: t('achievements','a4t'), year: t('achievements','a4y'), description: t('achievements','a4d'), icon: ACHIEVEMENT_ICONS[3], color: ACHIEVEMENT_COLORS[3] },
    { title: t('achievements','a5t'), year: t('achievements','a5y'), description: t('achievements','a5d'), icon: ACHIEVEMENT_ICONS[4], color: ACHIEVEMENT_COLORS[4] },
    { title: t('achievements','a6t'), year: t('achievements','a6y'), description: t('achievements','a6d'), icon: ACHIEVEMENT_ICONS[5], color: ACHIEVEMENT_COLORS[5] },
    { title: t('achievements','a7t'), year: t('achievements','a7y'), description: t('achievements','a7d'), icon: ACHIEVEMENT_ICONS[6], color: ACHIEVEMENT_COLORS[6] },
    { title: t('achievements','a8t'), year: t('achievements','a8y'), description: t('achievements','a8d'), icon: ACHIEVEMENT_ICONS[7], color: ACHIEVEMENT_COLORS[7] },
    { title: t('achievements','a9t'), year: t('achievements','a9y'), description: t('achievements','a9d'), icon: ACHIEVEMENT_ICONS[8], color: ACHIEVEMENT_COLORS[8] },
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
              <article
                key={i}
                className="group rounded-2xl border border-border bg-card p-5 sm:p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Icon + year row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color.split(' ')[0]}`}>
                    <item.icon className={`h-6 w-6 ${item.color.split(' ')[1]}`} aria-hidden="true" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {item.year}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-sm sm:text-base font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h2>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
