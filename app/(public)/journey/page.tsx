import { Calendar } from 'lucide-react';

export const metadata = {
  title: 'Journey — Pramod Rajput',
  description: 'A timeline of key milestones in the political and social journey of Pramod Rajput.',
};

const milestones = [
  {
    year: '2009',
    title: 'जनपद सदस्य एवं मंडल अध्यक्ष',
    description:
      'जनपद पंचायत फन्दा भोपाल में जनपद सदस्य निर्वाचित हुए। साथ ही भारतीय जनता युवा मोर्चा, फन्दा मंडल भोपाल ग्रामीण के मंडल अध्यक्ष के रूप में युवाओं को संगठित करने का कार्य आरंभ किया। यह पद 2014 तक रहा।',
    image:
      'https://images.pexels.com/photos/11461856/pexels-photo-11461856.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2012',
    title: 'मटकी फोड़ कार्यक्रम एवं दशहरा उत्सव का शुभारंभ',
    description:
      'श्री कृष्ण जन्माष्टमी के उपलक्ष्य में ग्रामीण क्षेत्र के विशाल मटकी फोड़ कार्यक्रम की शुरुआत की, जो आज भी प्रतिवर्ष 10,000 से अधिक भक्तों को एकत्र करता है। इसी वर्ष से दशहरा कार्यक्रम के वार्षिक आयोजन की भी नींव रखी।',
    image:
      'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2014',
    title: 'अखिल भारतीय कवि सम्मेलन का आयोजन',
    description:
      'वीर शिरोमणि महाराणा प्रताप की जयंती पर रात्रिकालीन अखिल भारतीय कवि सम्मेलन का आयोजन आरंभ किया। इस आयोजन के माध्यम से क्रांतिकारियों और महापुरुषों के त्याग एवं वीर गाथाओं को जन-जन तक पहुंचाने का संकल्प लिया। यह परंपरा 2025 तक निरंतर जारी है।',
    image:
      'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2015',
    title: 'राष्ट्रीय महासचिव एवं ब्लॉक क्रिकेट टूर्नामेंट',
    description:
      'गहलोत मेवाड़ा राजपूत समाज संगठन, युवापरिषद के राष्ट्रीय महासचिव पद पर नियुक्त हुए। इसी वर्ष से 2020 तक ब्लॉक स्तरीय रात्रिकालीन क्रिकेट टूर्नामेंट का आयोजन शुरू किया, जिसमें युवाओं ने उत्साह, सहयोग एवं रुचि दिखाई।',
    image:
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2018',
    title: 'जिला अध्यक्ष — भाजयुमो भोपाल ग्रामीण',
    description:
      'भारतीय जनता युवा मोर्चा, भोपाल ग्रामीण के जिला अध्यक्ष के रूप में निर्वाचित हुए। दीपावली के अवसर पर गरीब बस्तियों में कपड़े एवं मिष्ठान वितरण का सिलसिला भी इसी वर्ष से प्रारंभ किया, जो आज भी जारी है।',
    image:
      'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2019',
    title: 'श्रीमद् भागवत कथा का आयोजन',
    description:
      'मां चापलाखेड़ी के दरबार में भव्य श्रीमद् भागवत कथा का आयोजन किया। यह धार्मिक कार्यक्रम आसपास के सैकड़ों श्रद्धालुओं की आस्था का केंद्र बना।',
    image:
      'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2021',
    title: 'प्रदेश स्तरीय मैराथन दौड़ एवं पुनः जिला अध्यक्ष',
    description:
      '"Success की सबसे खास बात है कि, वो मेहनत करने वालों पर फिदा हो जाती हैं" — इस भाव के साथ 5 किलोमीटर की प्रदेश स्तरीय मैराथन दौड़ आयोजित की। इसी वर्ष भाजयुमो भोपाल ग्रामीण के जिला अध्यक्ष पद पर पुनः निर्वाचित हुए (2021–2025)।',
    image:
      'https://images.pexels.com/photos/34755223/pexels-photo-34755223.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2023',
    title: 'जिला स्तरीय नाईट क्रिकेट टूर्नामेंट',
    description:
      '"फिट युवा फॉर विकसित भारत" की सोच के साथ ग्रामीण नाईट क्रिकेट टूर्नामेंट का आयोजन किया, जिसमें 25 से अधिक टीमों ने भाग लिया। युवाओं में खेल के प्रति रुचि जगाने का यह प्रयास बेहद सफल रहा।',
    image:
      'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2024',
    title: 'जिला स्तरीय सामान्य ज्ञान प्रतियोगिता',
    description:
      'जिला स्तर पर विशाल सामान्य ज्ञान प्रतियोगिता का आयोजन किया जिसमें 5,000 छात्र-छात्राओं ने भाग लिया। सभी स्कूलों में प्रथम, द्वितीय, तृतीय एवं जिला स्तर पर भी शीर्ष विद्यार्थियों को चयनित कर पुरस्कृत किया गया।',
    image:
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2025 (वर्तमान)',
    title: 'जनपद अध्यक्ष एवं मंडल अध्यक्ष',
    description:
      'जनपद पंचायत फन्दा भोपाल के जनपद अध्यक्ष एवं भाजपा फन्दा मंडल भोपाल ग्रामीण के मंडल अध्यक्ष के रूप में जनसेवा जारी है। मटकी फोड़ कार्यक्रम, दशहरा उत्सव, कवि सम्मेलन एवं दीपावली वितरण जैसे वार्षिक आयोजन निरंतर चल रहे हैं।',
    image:
      'https://images.pexels.com/photos/15470221/pexels-photo-15470221.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function JourneyPage() {
  return (
    <div className="flex flex-col">
      <section className="relative py-24 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Journey</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">
              राजनीतिक एवं सामाजिक यात्रा
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              2009 में जनपद सदस्य से लेकर जनपद अध्यक्ष तक — हर पड़ाव पर जनसेवा, सामाजिक उत्थान
              और युवा सशक्तिकरण की अटूट प्रतिबद्धता।
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

            {milestones.map((milestone, i) => (
              <div
                key={i}
                className={`relative flex flex-col md:flex-row gap-6 mb-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } animate-slide-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 z-10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border-4 border-background">
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 md:text-right">
                  {i % 2 === 0 ? (
                    <div className="md:pr-8">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                        <Calendar className="h-3 w-3" />
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                    </div>
                  ) : (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-md">
                      <img src={milestone.image} alt={milestone.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 pl-12 md:pl-12">
                  {i % 2 === 0 ? (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-md">
                      <img src={milestone.image} alt={milestone.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="md:pl-8">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                        <Calendar className="h-3 w-3" />
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
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
