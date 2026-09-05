'use client';

import { Calendar, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

type Position = {
  role: { hi: string; en: string };
  org: { hi: string; en: string };
  period: { hi: string; en: string };
  current: boolean;
  category: 'political' | 'social';
};

const POSITIONS: Position[] = [
  {
    role:    { hi: 'जनपद अध्यक्ष',  en: 'Janpad President' },
    org:     { hi: 'जनपद पंचायत फन्दा, भोपाल', en: 'Janpad Panchayat Fanda, Bhopal' },
    period:  { hi: 'वर्तमान', en: 'Current' },
    current: true,
    category: 'political',
  },
  {
    role:    { hi: 'मंडल अध्यक्ष',  en: 'Mandal President' },
    org:     { hi: 'भाजपा फन्दा मंडल, भोपाल ग्रामीण', en: 'BJP Fanda Mandal, Bhopal Rural' },
    period:  { hi: 'वर्तमान', en: 'Current' },
    current: true,
    category: 'political',
  },
  {
    role:    { hi: 'जिला अध्यक्ष',  en: 'District President' },
    org:     { hi: 'भारतीय जनता युवा मोर्चा, भोपाल ग्रामीण', en: 'Bharatiya Janata Yuva Morcha, Bhopal Rural' },
    period:  { hi: '2021 – 2025', en: '2021 – 2025' },
    current: false,
    category: 'political',
  },
  {
    role:    { hi: 'जिला अध्यक्ष',  en: 'District President' },
    org:     { hi: 'भारतीय जनता युवा मोर्चा, भोपाल ग्रामीण', en: 'Bharatiya Janata Yuva Morcha, Bhopal Rural' },
    period:  { hi: '2018 – 2021', en: '2018 – 2021' },
    current: false,
    category: 'political',
  },
  {
    role:    { hi: 'मंडल अध्यक्ष',  en: 'Mandal President' },
    org:     { hi: 'भाजयुमो, फन्दा मंडल, भोपाल ग्रामीण', en: 'BJYM, Fanda Mandal, Bhopal Rural' },
    period:  { hi: '2009 – 2014', en: '2009 – 2014' },
    current: false,
    category: 'political',
  },
  {
    role:    { hi: 'जनपद सदस्य',  en: 'Janpad Member' },
    org:     { hi: 'जनपद पंचायत फन्दा, भोपाल', en: 'Janpad Panchayat Fanda, Bhopal' },
    period:  { hi: '2009 – 2014', en: '2009 – 2014' },
    current: false,
    category: 'political',
  },
  {
    role:    { hi: 'राष्ट्रीय महासचिव', en: 'National General Secretary' },
    org:     { hi: 'गहलोत मेवाड़ा राजपूत समाज संगठन, युवापरिषद', en: 'Gahlot Mewada Rajput Samaj Sangathan, Yuva Parishad' },
    period:  { hi: '2015 – 2025', en: '2015 – 2025' },
    current: false,
    category: 'social',
  },
];

export default function JourneyPage() {
  const { t, lang } = useLanguage();

  const politicalPositions = POSITIONS.filter(p => p.category === 'political');
  const socialPositions    = POSITIONS.filter(p => p.category === 'social');

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              {t('journey', 'tag')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 sm:mb-6 text-balance">
              {t('journey', 'title')}
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
              {t('journey', 'desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Positions */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">

          {/* Political Positions */}
          <div className="mb-14">
            <h2 className="text-xl sm:text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="inline-block w-1 h-6 rounded bg-primary" />
              {lang === 'hi' ? 'राजनीतिक स्तर पर पद' : 'Political Positions'}
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-0">
                {politicalPositions.map((p, i) => (
                  <div
                    key={i}
                    className="relative flex gap-4 sm:gap-6 pb-8 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Dot */}
                    <div className="relative z-10 shrink-0 flex flex-col items-center pt-1">
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-background shadow text-xs font-bold
                        ${p.current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}
                      </div>
                    </div>

                    {/* Card */}
                    <div className={`flex-1 rounded-xl border p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md
                      ${p.current ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm sm:text-base leading-snug">
                          {lang === 'hi' ? p.role.hi : p.role.en}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0
                          ${p.current
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-primary/10 text-primary'}`}>
                          <Calendar className="h-3 w-3" />
                          {lang === 'hi' ? p.period.hi : p.period.en}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {lang === 'hi' ? p.org.hi : p.org.en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Positions */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="inline-block w-1 h-6 rounded bg-primary" />
              {lang === 'hi' ? 'सामाजिक स्तर पर पद' : 'Social Positions'}
            </h2>
            <div className="relative">
              <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-0">
                {socialPositions.map((p, i) => (
                  <div
                    key={i}
                    className="relative flex gap-4 sm:gap-6 pb-8 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="relative z-10 shrink-0 flex flex-col items-center pt-1">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-background shadow text-xs font-bold">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm sm:text-base leading-snug">
                          {lang === 'hi' ? p.role.hi : p.role.en}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold shrink-0">
                          <Calendar className="h-3 w-3" />
                          {lang === 'hi' ? p.period.hi : p.period.en}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {lang === 'hi' ? p.org.hi : p.org.en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
