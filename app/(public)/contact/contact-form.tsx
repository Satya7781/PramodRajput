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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = t('contact', 'fillRequired');
    if (!form.email.trim())   e.email   = t('contact', 'fillRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              e.email   = t('contact', 'invalidEmail');
    if (!form.message.trim()) e.message = t('contact', 'fillRequired');
    else if (form.message.trim().length < 10)
                              e.message = t('contact', 'messageTooShort');
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name.trim(),
          email:   form.email.trim(),
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t('common', 'error'));
        return;
      }
      setSuccess(true);
      toast.success(t('contact', 'sentSuccess'));
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error(t('common', 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-scale-in">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 mb-4">
          <CheckCircle2 className="h-7 w-7 text-secondary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{t('contact', 'successTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('contact', 'successDesc')}</p>
        <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
          {t('contact', 'sendAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs sm:text-sm">
          {t('contact', 'nameLabel')} <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(p => ({ ...p, name: '' })); }}
          placeholder={t('contact', 'namePlaceholder')}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={`text-sm ${errors.name ? 'border-destructive' : ''}`}
        />
        {errors.name && <p id="name-error" className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs sm:text-sm">
          {t('contact', 'emailLabel')} <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(p => ({ ...p, email: '' })); }}
          placeholder={t('contact', 'emailPlaceholder')}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`text-sm ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p id="email-error" className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-xs sm:text-sm">{t('contact', 'subjectLabel')}</Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
          placeholder={t('contact', 'subjectPlaceholder')}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-xs sm:text-sm">
          {t('contact', 'messageLabel')} <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={e => { setForm({ ...form, message: e.target.value }); setErrors(p => ({ ...p, message: '' })); }}
          placeholder={t('contact', 'messagePlaceholder')}
          rows={5}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={`text-sm ${errors.message ? 'border-destructive' : ''}`}
        />
        {errors.message && <p id="message-error" className="text-xs text-destructive">{errors.message}</p>}
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('contact', 'sending')}</>
          : t('contact', 'sendBtn')}
      </Button>
    </form>
  );
}
