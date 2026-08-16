import { Award, Trophy, Medal, Star, Users, BookOpen, Music, Heart, Dumbbell } from 'lucide-react';

export const metadata = {
  title: 'Achievements — Pramod Rajput',
  description: 'सामाजिक स्तर पर महत्वपूर्ण कार्य — Key social achievements and community initiatives by Pramod Rajput.',
};

const achievements = [
  {
    icon: BookOpen,
    title: 'जिला स्तरीय सामान्य ज्ञान प्रतियोगिता',
    year: '2024',
    description:
      'जिला स्तर पर सामान्य ज्ञान प्रतियोगिता आयोजित की गई जिसमें 5,000 छात्र-छात्राओं ने भाग लिया। सभी स्कूलों में प्रथम, द्वितीय, तृतीय एवं जिला स्तर पर भी शीर्ष विद्यार्थियों को चयनित कर पुरस्कृत किया गया।',
    image: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Trophy,
    title: 'ग्रामीण क्षेत्र का विशाल मटकी फोड़ कार्यक्रम',
    year: '2012 से निरंतर',
    description:
      'श्री कृष्ण जन्माष्टमी के उपलक्ष्य में 15 वर्षों से ग्रामीण क्षेत्र की सबसे बड़ी एवं भव्य मटकी फोड़ कार्यक्रम का आयोजन। प्रतिवर्ष 5 से 10 टीमें भाग लेती हैं, ₹1,00,000 की पुरस्कार राशि दी जाती है और आसपास के 25 गांवों से 10,000 से अधिक भक्तजन आनंद लेने आते हैं।',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Dumbbell,
    title: 'जिला स्तरीय नाईट क्रिकेट टूर्नामेंट',
    year: '2023',
    description:
      '"फिट युवा फॉर विकसित भारत" की सोच के साथ ग्रामीण युवाओं में खेल रुचि बढ़ाने के लिए नाईट क्रिकेट टूर्नामेंट का आयोजन किया, जिसमें 25 से अधिक टीमों ने भाग लिया।',
    image: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Medal,
    title: 'प्रदेश स्तरीय मैराथन दौड़',
    year: '2021',
    description:
      '"Success की सबसे खास बात है कि, वो मेहनत करने वालों पर फिदा हो जाती हैं" — इस प्रेरणा के साथ 5 किलोमीटर की प्रदेश स्तरीय मैराथन दौड़ का आयोजन किया, जिसमें बड़ी संख्या में युवाओं ने भाग लिया।',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Trophy,
    title: 'ब्लॉक स्तरीय रात्रिकालीन क्रिकेट टूर्नामेंट',
    year: '2015 – 2020',
    description:
      'वर्ष 2015 से 2020 तक लगातार ब्लॉक स्तरीय रात्रिकालीन क्रिकेट टूर्नामेंट आयोजित किए, जिनमें युवाओं ने उत्साह, सहयोग एवं रुचि दिखाई।',
    image: 'https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Star,
    title: 'दशहरा कार्यक्रम का आयोजन',
    year: '2012 – 2025',
    description:
      'धर्म विजय के प्रतीक दशहरा का प्रतिवर्ष आयोजन — लोगों को श्री राम जी के व्यक्तित्व एवं धर्म के प्रति जागरूक रखने के उद्देश्य से यह वार्षिक उत्सव निरंतर आयोजित होता है।',
    image: 'https://images.pexels.com/photos/15470221/pexels-photo-15470221.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Music,
    title: 'रात्रि कालीन अखिल भारतीय कवि सम्मेलन',
    year: '2014 – 2025',
    description:
      'वीर शिरोमणि महाराणा प्रताप की जयंती पर 11 वर्षों से लगातार अखिल भारतीय कवि सम्मेलन का आयोजन। महाराणा प्रताप के त्याग और वीरता को तथा अन्य क्रांतिकारियों एवं महापुरुषों की गाथाओं को जन-जन तक पहुंचाने का प्रयास।',
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Award,
    title: 'मां चापलाखेड़ी में श्रीमद् भागवत कथा',
    year: '2019',
    description:
      'मां चापलाखेड़ी के दरबार में भव्य श्रीमद् भागवत कथा का आयोजन किया। इस धार्मिक अनुष्ठान में क्षेत्र के सैकड़ों श्रद्धालुओं ने भाग लिया और आध्यात्मिक लाभ प्राप्त किया।',
    image: 'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Heart,
    title: 'गरीब बस्तियों में कपड़े एवं मिष्ठान वितरण',
    year: '2018 – 2025',
    description:
      'दीपावली के पावन त्योहार पर प्रतिवर्ष गरीब बस्तियों में कपड़े एवं मिष्ठान का वितरण — समाज के वंचित वर्ग के चेहरों पर खुशी लाने की यह परंपरा 2018 से निरंतर जारी है।',
    image: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function AchievementsPage() {
  return (
    <div className="flex flex-col">
      <section className="relative py-24 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Achievements</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">
              सामाजिक स्तर पर महत्वपूर्ण कार्य
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              वर्षों की जनसेवा में किए गए प्रमुख सामाजिक, सांस्कृतिक एवं युवा सशक्तिकरण के कार्य —
              हर उपलब्धि जनता के विश्वास और सहयोग का प्रतिफल है।
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={achievement.image}
                    alt={achievement.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <achievement.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{achievement.year}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
