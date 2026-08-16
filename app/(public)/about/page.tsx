import Link from 'next/link';
import { ArrowRight, Heart, Target, Users, Award, BookOpen, Music, Trophy, Shield, Star } from 'lucide-react';

export const metadata = {
  title: 'About — Pramod Rajput',
  description: 'Learn about the life, mission, and values of Pramod Rajput — a dedicated public servant and community leader from Bhopal.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">About</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">
              A Life Dedicated to Public Service
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              प्रमोद राजपूत एक समर्पित जनसेवक, सामाजिक कार्यकर्ता और भारतीय जनता पार्टी के सक्रिय नेता हैं।
              फन्दा कला, भोपाल के रहने वाले प्रमोद जी वर्षों से ग्रामीण क्षेत्रों में युवाओं, समाज और जनता की
              सेवा में अग्रणी भूमिका निभा रहे हैं।
            </p>
          </div>
        </div>
      </section>

      {/* Biography */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Biography</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  13 फरवरी 1986 को जन्मे प्रमोद राजपूत, श्री भेरू सिंह के सुपुत्र हैं और श्री हरिहर नगर फन्दा कला,
                  तहसील हुजुर, जिला भोपाल (म.प्र.) के निवासी हैं। उन्होंने स्नातक की शिक्षा प्राप्त की और
                  हिंदी व अंग्रेजी भाषाओं में दक्षता हासिल की।
                </p>
                <p>
                  प्रमोद जी की रुचि लेखन, गायन, संगीत एवं कम्प्यूटर-इंटरनेट में रही है। भारतीय जनता पार्टी
                  के एक समर्पित स्वयंसेवक के रूप में उन्होंने वर्ष 2009 से अपनी राजनीतिक यात्रा आरंभ की
                  और तब से लगातार जनसेवा में संलग्न हैं।
                </p>
                <p>
                  राजनीतिक क्षेत्र में वे जनपद पंचायत फन्दा के वर्तमान अध्यक्ष हैं और भाजपा फन्दा मंडल के
                  मंडल अध्यक्ष के रूप में कार्यरत हैं। इससे पूर्व वे भारतीय जनता युवा मोर्चा भोपाल ग्रामीण के
                  जिला अध्यक्ष रहे — पहले 2018 से 2021 तक और पुनः 2021 से 2025 तक। वर्ष 2009 से 2014 तक
                  वे जनपद सदस्य तथा भाजयुमो के मंडल अध्यक्ष भी रहे।
                </p>
                <p>
                  सामाजिक क्षेत्र में वे गहलोत मेवाड़ा राजपूत समाज संगठन, युवापरिषद के राष्ट्रीय महासचिव
                  के रूप में 2015 से 2025 तक सेवारत रहे। उनका मानना है कि समाज की वास्तविक उन्नति
                  ग्रामीण जड़ों से ही होती है, इसलिए उन्होंने सदैव जमीनी स्तर पर काम करने को प्राथमिकता दी है।
                </p>
              </div>

              {/* Political Positions */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">राजनीतिक स्तर पर पद</h3>
                <div className="space-y-3">
                  {[
                    { period: 'वर्तमान', role: 'जनपद अध्यक्ष', org: 'जनपद पंचायत फन्दा भोपाल' },
                    { period: 'वर्तमान', role: 'मंडल अध्यक्ष', org: 'भाजपा फन्दा मंडल भोपाल ग्रामीण' },
                    { period: '2021 – 2025', role: 'जिला अध्यक्ष', org: 'भारतीय जनता युवा मोर्चा, भोपाल ग्रामीण' },
                    { period: '2018 – 2021', role: 'जिला अध्यक्ष', org: 'भारतीय जनता युवा मोर्चा, भोपाल ग्रामीण' },
                    { period: '2009 – 2014', role: 'मंडल अध्यक्ष', org: 'भारतीय जनता युवा मोर्चा, फन्दा मंडल भोपाल ग्रामीण' },
                    { period: '2009 – 2014', role: 'जनपद सदस्य', org: 'जनपद पंचायत फन्दा भोपाल' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.role}</p>
                        <p className="text-sm text-muted-foreground">{item.org}</p>
                        <span className="inline-block mt-1 rounded-full bg-secondary/10 text-secondary px-2 py-0.5 text-xs font-medium">
                          {item.period}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Position */}
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-4">सामाजिक स्तर पर पद</h3>
                <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">राष्ट्रीय महासचिव</p>
                    <p className="text-sm text-muted-foreground">गहलोत मेवाड़ा राजपूत समाज संगठन, युवापरिषद</p>
                    <span className="inline-block mt-1 rounded-full bg-secondary/10 text-secondary px-2 py-0.5 text-xs font-medium">
                      2015 – 2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">नाम</dt>
                    <dd className="font-medium">प्रमोद राजपूत</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">पिता का नाम</dt>
                    <dd className="font-medium">श्री भेरू सिंह</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">जन्म दिनांक</dt>
                    <dd className="font-medium">13 फरवरी 1986</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">शैक्षणिक योग्यता</dt>
                    <dd className="font-medium">स्नातक</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">वैवाहिक स्थिति</dt>
                    <dd className="font-medium">विवाहित</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">भाषा</dt>
                    <dd className="font-medium">हिंदी, अंग्रेजी</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground shrink-0">पता</dt>
                    <dd className="font-medium text-right">श्री हरिहर नगर फन्दा कला, तह. हुजुर, जिला भोपाल (म.प्र.) 462030</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">संगठन</dt>
                    <dd className="font-medium text-right">भारतीय जनता पार्टी एवं स्वयं सेवक</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">अन्य ज्ञान / रुचि</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>लेखन (Writing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Music className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>गायन एवं संगीत (Singing & Music)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>कम्प्यूटर एवं इंटरनेट</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Core Values</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>हर नागरिक के प्रति करुणा</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>जनसेवा में ईमानदारी</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>पारदर्शिता एवं जवाबदेही</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>समुदाय-केंद्रित विकास</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Work & Social Initiatives */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">सामाजिक कार्य एवं पहलें</h2>
            <p className="text-muted-foreground">मुख्य क्षेत्र जो हर कार्यक्रम और पहल को दिशा देते हैं।</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'युवा सशक्तिकरण', desc: 'क्रिकेट टूर्नामेंट, मैराथन दौड़ और युवा नेतृत्व कार्यक्रमों के माध्यम से युवाओं को प्रेरित करना।' },
              { icon: BookOpen, title: 'शिक्षा', desc: 'जिला स्तरीय सामान्य ज्ञान प्रतियोगिताओं का आयोजन कर छात्रों को पुरस्कृत करना।' },
              { icon: Heart, title: 'धार्मिक एवं सांस्कृतिक कार्य', desc: 'मटकी फोड़ कार्यक्रम, दशहरा उत्सव, कवि सम्मेलन और भागवत कथा का आयोजन।' },
              { icon: Award, title: 'गरीब कल्याण', desc: 'दीपावली पर गरीब बस्तियों में कपड़े एवं मिष्ठान वितरण — 2018 से निरंतर।' },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-5">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl bg-secondary text-secondary-foreground p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Explore the Journey</h2>
            <p className="text-secondary-foreground/80 mb-6 max-w-xl mx-auto">
              राजनीतिक और सामाजिक यात्रा के प्रमुख पड़ावों और उपलब्धियों को जानें।
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/journey" className="inline-flex items-center gap-2 rounded-lg bg-white/15 border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/25 transition-all">
                View Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/achievements" className="inline-flex items-center gap-2 rounded-lg bg-white/15 border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/25 transition-all">
                View Achievements
                <Award className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
