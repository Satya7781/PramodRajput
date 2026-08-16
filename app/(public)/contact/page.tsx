import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';
import { ContactForm } from './contact-form';

export const metadata = {
  title: 'Contact — Pramod Rajput',
  description: 'Get in touch with Pramod Rajput and the team for inquiries, collaborations, and community initiatives.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Contact</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">Get In Touch</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question, suggestion, or want to collaborate? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">contact@pramodrajput.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">123 Main Road, District HQ,<br />Maharashtra, India</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Follow on Social Media</h3>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Youtube, label: 'YouTube' },
                  ].map((social, i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-secondary/5 border border-border p-6">
                <h3 className="font-semibold mb-2">Office Hours</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Monday — Friday: 9:00 AM — 6:00 PM</p>
                  <p>Saturday: 9:00 AM — 2:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
              <h2 className="text-xl font-bold mb-6">Send a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
