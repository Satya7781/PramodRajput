'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

export function ContactForm() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t('contact', 'fillRequired'));
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setSuccess(true);
    toast.success(t('contact', 'sentSuccess'));
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-scale-in">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 mb-4">
          <CheckCircle2 className="h-7 w-7 text-secondary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{t('contact', 'successTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('contact', 'successDesc')}</p>
        <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>{t('contact', 'sendAnother')}</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs sm:text-sm">{t('contact', 'nameLabel')} <span className="text-destructive">*</span></Label>
        <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('contact', 'namePlaceholder')} required className="text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs sm:text-sm">{t('contact', 'emailLabel')} <span className="text-destructive">*</span></Label>
        <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('contact', 'emailPlaceholder')} required className="text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-xs sm:text-sm">{t('contact', 'subjectLabel')}</Label>
        <Input id="subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('contact', 'subjectPlaceholder')} className="text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-xs sm:text-sm">{t('contact', 'messageLabel')} <span className="text-destructive">*</span></Label>
        <Textarea id="message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('contact', 'messagePlaceholder')} rows={5} required className="text-sm" />
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('contact', 'sending')}</> : t('contact', 'sendBtn')}
      </Button>
    </form>
  );
}
