'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Target, Users, Award, BookOpen, Music, Trophy, Shield, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useLanguage();

  const politicalPositions = [
    { period: t('about', 'currently'), role: t('about', 'role_jp_adhyaksh'),    org: t('about', 'org_jp_fanda') },
    { period: t('about', 'currently'), role: t('about', 'role_mandal_adhyaksh'), org: t('about', 'org_bjp_fanda') },
    { period: '2021 – 2025', role: t('about', 'role_jila_adhyaksh'),  org: t('about', 'org_bjym_bhopal') },
    { period: '2018 – 2021', role: t('about', 'role_jila_adhyaksh'),  org: t('about', 'org_bjym_bhopal') },
    { period: '2009 – 2014', role: t('about', 'role_mandal_adhyaksh'), org: t('about', 'org_bjym_fanda') },
    { period: '2009 – 2014', role: t('about', 'role_jp_sadasya'),     org: t('about', 'org_jp_fanda') },
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
    { k: t('about', 'pi_addr'),    v: t('about', 'pi_addrVal') },
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
      <section className="py-16 sm:py-24 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t('about', 'tag')}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">{t('about', 'title')}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{t('about', 'desc')}</p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-xl sm:text-2xl font-bold">{t('about', 'bioTitle')}</h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>{t('about', 'bio1')}</p>
                <p>{t('about', 'bio2')}</p>
                <p>{t('about', 'bio3')}</p>
                <p>{t('about', 'bio4')}</p>
              </div>

              <div className="mt-6 sm:mt-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4">{t('about', 'politicalTitle')}</h3>
                <div className="space-y-3">
                  {politicalPositions.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-foreground">{item.role}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.org}</p>
                        <span className="inline-block mt-1 rounded-full bg-secondary/10 text-secondary px-2 py-0.5 text-xs font-medium">{item.period}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg sm:text-xl font-bold mb-4">{t('about', 'socialTitle')}</h3>
                <div className="flex items-start gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-foreground">{t('about', 'role_rashtriya_sachiv')}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('about', 'org_gahlot')}</p>
                    <span className="inline-block mt-1 rounded-full bg-secondary/10 text-secondary px-2 py-0.5 text-xs font-medium">2015 – 2025</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">{t('about', 'personalTitle')}</h3>
                <dl className="space-y-3 text-xs sm:text-sm">
                  {personalInfo.map((row, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground shrink-0">{row.k}</dt>
                      <dd className="font-medium text-right">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">{t('about', 'interestsTitle')}</h3>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {interests.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">{t('about', 'valuesTitle')}</h3>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {coreValues.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <item.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('about', 'workTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('about', 'workDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {workItems.map((item, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-card p-5 sm:p-6 hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary transition-colors mb-4 sm:mb-5">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl bg-secondary text-secondary-foreground p-6 sm:p-8 lg:p-12 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{t('about', 'ctaTitle')}</h2>
            <p className="text-secondary-foreground/80 mb-5 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">{t('about', 'ctaDesc')}</p>
            <div className="flex flex-col xs:flex-row flex-wrap justify-center gap-3">
              <Link href="/journey" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 border border-white/20 px-5 sm:px-6 py-3 text-sm font-semibold hover:bg-white/25 transition-all">
                {t('about', 'viewJourney')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/achievements" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 border border-white/20 px-5 sm:px-6 py-3 text-sm font-semibold hover:bg-white/25 transition-all">
                {t('about', 'viewAchievements')} <Award className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
