'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Target, Users, Award, BookOpen, Music, Trophy, Shield, Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useLanguage();

  const politicalPositions = [
    { period: t('about', 'currently'), role: t('about', 'role_jp_adhyaksh'),     org: t('about', 'org_jp_fanda'),    current: true },
    { period: t('about', 'currently'), role: t('about', 'role_mandal_adhyaksh'), org: t('about', 'org_bjp_fanda'),   current: true },
    { period: '2021 – 2025',           role: t('about', 'role_jila_adhyaksh'),   org: t('about', 'org_bjym_bhopal'), current: false },
    { period: '2018 – 2021',           role: t('about', 'role_jila_adhyaksh'),   org: t('about', 'org_bjym_bhopal'), current: false },
    { period: '2009 – 2014',           role: t('about', 'role_mandal_adhyaksh'), org: t('about', 'org_bjym_fanda'),  current: false },
    { period: '2009 – 2014',           role: t('about', 'role_jp_sadasya'),      org: t('about', 'org_jp_fanda'),    current: false },
  ];

  const workItems = [
    { icon: Users,    title: t('about', 'work1Title'), desc: t('about', 'work1Desc') },
    { icon: BookOpen, title: t('about', 'work2Title'), desc: t('about', 'work2Desc') },
    { icon: Heart,    title: t('about', 'work3Title'), desc: t('about', 'work3Desc') },
    { icon: Award,    title: t('about', 'work4Title'), desc: t('about', 'work4Desc') },
  ];

  const personalInfo = [
    { k: t('about', 'pi_name'),    v: t('about', 'pi_nameVal') },
    { k: t('about', 'pi_father'),  v: t('about', 'pi_fatherVal') },
    { k: t('about', 'pi_dob'),     v: t('about', 'pi_dobVal') },
    { k: t('about', 'pi_edu'),     v: t('about', 'pi_eduVal') },
    { k: t('about', 'pi_marital'), v: t('about', 'pi_maritalVal') },
    { k: t('about', 'pi_lang'),    v: t('about', 'pi_langVal') },
  ];

  const interests = [
    { icon: BookOpen, label: t('about', 'int1') },
    { icon: Music,    label: t('about', 'int2') },
    { icon: Target,   label: t('about', 'int3') },
  ];

  const coreValues = [
    { icon: Heart,  label: t('about', 'cv1') },
    { icon: Shield, label: t('about', 'cv2') },
    { icon: Target, label: t('about', 'cv3') },
    { icon: Users,  label: t('about', 'cv4') },
  ];

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="py-14 sm:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('about', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3 mb-4 text-balance leading-tight">{t('about', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('about', 'desc')}</p>
          </div>
        </div>
      </section>

      {/* Bio + positions + sidebar */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-10">

              {/* Biography */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-5">{t('about', 'bioTitle')}</h2>
                <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p>{t('about', 'bio1')}</p>
                  <p>{t('about', 'bio2')}</p>
                  <p>{t('about', 'bio3')}</p>
                  <p>{t('about', 'bio4')}</p>
                </div>
              </div>

              {/* Political positions */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4">{t('about', 'politicalTitle')}</h3>
                <div className="space-y-3">
                  {politicalPositions.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 transition-colors
                        ${item.current ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.current ? 'bg-primary' : 'bg-primary/10'}`}>
                        <Trophy className={`h-4 w-4 ${item.current ? 'text-primary-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-sm sm:text-base">{item.role}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0
                            ${item.current
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                              : 'bg-muted text-muted-foreground'}`}>
                            {item.period}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{item.org}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social position */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4">{t('about', 'socialTitle')}</h3>
                <div className="flex items-start gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-3.5 sm:p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-sm sm:text-base">{t('about', 'role_rashtriya_sachiv')}</p>
                      <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-semibold">2015 – 2025</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t('about', 'org_gahlot')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Personal info */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-bold mb-4 text-sm sm:text-base flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-primary inline-block" />
                  {t('about', 'personalTitle')}
                </h3>
                <dl className="space-y-3">
                  {personalInfo.map((row, i) => (
                    <div key={i} className="flex justify-between gap-3 text-xs sm:text-sm py-2 border-b border-border last:border-0">
                      <dt className="text-muted-foreground shrink-0">{row.k}</dt>
                      <dd className="font-medium text-right">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Interests */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-bold mb-4 text-sm sm:text-base flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-primary inline-block" />
                  {t('about', 'interestsTitle')}
                </h3>
                <ul className="space-y-2.5">
                  {interests.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <item.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Core values */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-bold mb-4 text-sm sm:text-base flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-primary inline-block" />
                  {t('about', 'valuesTitle')}
                </h3>
                <ul className="space-y-2.5">
                  {coreValues.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work & initiatives */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">{t('about', 'workTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('about', 'workDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {workItems.map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card p-5 sm:p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary transition-colors mb-4">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground p-7 sm:p-10 lg:p-14 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-3">{t('about', 'ctaTitle')}</h2>
            <p className="text-secondary-foreground/80 mb-6 max-w-xl mx-auto text-sm sm:text-base">{t('about', 'ctaDesc')}</p>
            <Link
              href="/journey"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-6 py-3 text-sm font-bold hover:bg-white/25 active:scale-95 transition-all"
            >
              {t('about', 'viewJourney')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
