import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Award, Newspaper, ImageIcon, Video as VideoIcon, Trophy, Heart, Target, TrendingUp } from 'lucide-react';
import type { Event, News, PhotoAlbum, Video } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';

async function getHomepageData() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [eventsRes, newsRes, albumsRes, videosRes] = await Promise.allSettled([
    fetch(`${base}/api/events?status=published&limit=3`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    fetch(`${base}/api/news?limit=3`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    fetch(`${base}/api/albums?limit=4`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    fetch(`${base}/api/videos?limit=2`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
  ]);

  return {
    events: (eventsRes.status === 'fulfilled' ? eventsRes.value : []) as Event[],
    news: (newsRes.status === 'fulfilled' ? newsRes.value : []) as News[],
    albums: (albumsRes.status === 'fulfilled' ? albumsRes.value : []) as PhotoAlbum[],
    videos: (videosRes.status === 'fulfilled' ? videosRes.value : []) as Video[],
  };
}

export default async function HomePage() {
  const { events, news, albums, videos } = await getHomepageData();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/15470221/pexels-photo-15470221.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Pramod Rajput addressing a public gathering"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 px-4 py-1.5 text-sm font-medium text-primary-foreground mb-6">
              Serving People, Building Tomorrow
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight text-balance mb-6">
              Pramod Rajput
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
              भारतीय जनता पार्टी के समर्पित कार्यकर्ता, जनपद अध्यक्ष — फन्दा पंचायत भोपाल। युवा सशक्तिकरण, सामाजिक उत्थान और ग्रामीण विकास के लिए प्रतिबद्ध।
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105">
                Explore Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/events" className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Community gathering" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-xl p-6 shadow-lg hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">13+</p>
                    <p className="text-sm text-muted-foreground">Years of Service</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">परिचय</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-6 text-balance">जनता की आवाज़, विकास का संकल्प</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                प्रमोद राजपूत ने अपना जीवन फन्दा कला, भोपाल की जनता की सेवा में समर्पित किया है। 2009 से राजनीतिक और सामाजिक कार्यों में सक्रिय रहते हुए उन्होंने युवाओं, किसानों और ग्रामीण समुदायों के लिए अनेक महत्वपूर्ण पहलें की हैं।
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                जनपद पंचायत फन्दा के अध्यक्ष और भाजपा फन्दा मंडल के मंडल अध्यक्ष के रूप में वे निरंतर जनसेवा में अग्रणी हैं।
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                प्रमोद राजपूत के बारे में और जानें
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/5 border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '10,000+', label: 'भक्तजन (मटकी फोड़)' },
              { icon: Calendar, value: '9+', label: 'प्रमुख सामाजिक आयोजन' },
              { icon: Award, value: '11+', label: 'कवि सम्मेलन (वर्ष)' },
              { icon: TrendingUp, value: '5,000+', label: 'छात्र (GK प्रतियोगिता 2024)' },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">About</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4 text-balance">उद्देश्य से प्रेरित, मूल्यों से निर्देशित</h2>
            <p className="text-muted-foreground">वे मूल सिद्धांत जो इस मिशन को परिभाषित करते हैं और हर पहल को दिशा देते हैं।</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'जनता सर्वप्रथम', desc: 'हर निर्णय और पहल की जड़ें जनता की जरूरतों और आकांक्षाओं में हैं।' },
              { icon: Heart, title: 'स्वयं से पहले सेवा', desc: 'ईमानदारी, पारदर्शिता और जवाबदेही के साथ जनसेवा के लिए समर्पित।' },
              { icon: Trophy, title: 'युवा सशक्तिकरण', desc: 'क्रिकेट टूर्नामेंट, मैराथन और प्रतियोगिताओं के माध्यम से युवाओं में नई ऊर्जा का संचार।' },
            ].map((item, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-card p-8 hover:shadow-lg hover:border-primary/30 transition-all animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-6">
                  <item.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">What's Coming Up</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2">Upcoming Events</h2>
            </div>
            <Link href="/events" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              View All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <Link key={event.id} href={`/events/${event.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {event.banner_url ? (
                      <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted"><Calendar className="h-12 w-12 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      {event.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.start_date)}</span>}
                      {event.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue}</span>}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.short_description}</p>
                    {event.registration_enabled && event.status === 'registration_open' && (
                      <span className="inline-block mt-4 rounded-full bg-secondary/10 text-secondary px-3 py-1 text-xs font-medium">Registration Open</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No upcoming events at this time. Please check back soon.</div>
          )}
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Stay Updated</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2">Latest News</h2>
            </div>
            <Link href="/news" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              All News <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((article, i) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {article.featured_image_url ? (
                      <img src={article.featured_image_url} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted"><Newspaper className="h-12 w-12 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="p-6">
                    {article.news_categories && (
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">{article.news_categories.name}</span>
                    )}
                    <h3 className="text-lg font-bold mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No news articles published yet.</div>
          )}
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Gallery</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4">Moments That Matter</h2>
            <p className="text-muted-foreground">A glimpse into the community initiatives, events, and outreach programs.</p>
          </div>
          {albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {albums.map((album, i) => (
                <Link key={album.id} href="/gallery/photos" className="group relative aspect-square rounded-xl overflow-hidden hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  {album.cover_image_url ? (
                    <img src={album.cover_image_url} alt={album.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted"><ImageIcon className="h-10 w-10 text-muted-foreground" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <h3 className="text-sm font-semibold text-white">{album.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No photo albums available yet.</div>
          )}
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/gallery/photos" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors">
              <ImageIcon className="h-4 w-4" /> View Photos
            </Link>
            <Link href="/gallery/videos" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors">
              <VideoIcon className="h-4 w-4" /> Watch Videos
            </Link>
          </div>
        </div>
      </section>

      {/* Social CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Stay Connected</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">Follow the journey on social media for the latest updates, event coverage, and community stories.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((s) => (
              <a key={s} href="#" className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-all">{s}</a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
