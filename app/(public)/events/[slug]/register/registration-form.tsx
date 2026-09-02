'use client';

import { useState } from 'react';
import { registrations } from '@/lib/api-client';
import type { FormField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

interface RegistrationFormProps {
  eventId: string;
  formId: string;
  fields: FormField[];
}

export function RegistrationForm({ eventId, formId, fields }: RegistrationFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.is_required && !values[field.field_key]?.trim()) {
        newErrors[field.field_key] = `${field.label} ${t('registration', 'required')}`;
      }
      if (field.field_type === 'email' && values[field.field_key]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.field_key])) {
          newErrors[field.field_key] = t('registration', 'invalidEmail');
        }
      }
      if (field.field_type === 'phone' && values[field.field_key]) {
        if (!/^[+]?[\d\s-]{10,15}$/.test(values[field.field_key])) {
          newErrors[field.field_key] = t('registration', 'invalidPhone');
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const reg = await registrations.submit({
        event_id: eventId, form_id: formId,
        values: fields.filter(f => values[f.field_key]).map(f => ({ field_id: f.id, value_text: values[f.field_key] })),
      });
      setSuccess(reg.registration_number);
      toast.success(t('registration', 'success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common', 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-scale-in">
        <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-secondary/10 mb-5 sm:mb-6">
          <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-secondary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('registration', 'success')}</h2>
        <p className="text-sm text-muted-foreground mb-5 sm:mb-6">{t('registration', 'successDesc')}</p>
        <div className="rounded-xl bg-muted p-5 sm:p-6 mb-5 sm:mb-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('registration', 'regNumber')}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-wider text-primary">{success}</p>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">{t('registration', 'saveNumber')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {fields.map(field => (
        <div key={field.id} className="space-y-1.5 sm:space-y-2">
          <Label htmlFor={field.field_key} className="text-xs sm:text-sm">
            {field.label}{field.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}

          {['text','email','phone','number','date'].includes(field.field_type) && (
            <Input
              id={field.field_key}
              type={field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : field.field_type === 'email' ? 'email' : field.field_type === 'date' ? 'date' : 'text'}
              placeholder={field.placeholder ?? ''}
              value={values[field.field_key] ?? ''}
              onChange={e => setValues(p => ({ ...p, [field.field_key]: e.target.value }))}
              className={`text-sm ${errors[field.field_key] ? 'border-destructive' : ''}`}
            />
          )}

          {field.field_type === 'textarea' && (
            <Textarea id={field.field_key} placeholder={field.placeholder ?? ''} value={values[field.field_key] ?? ''} onChange={e => setValues(p => ({ ...p, [field.field_key]: e.target.value }))} rows={3} className={`text-sm ${errors[field.field_key] ? 'border-destructive' : ''}`} />
          )}

          {field.field_type === 'dropdown' && field.form_field_options && (
            <Select value={values[field.field_key] ?? ''} onValueChange={v => setValues(p => ({ ...p, [field.field_key]: v }))}>
              <SelectTrigger className={`text-sm ${errors[field.field_key] ? 'border-destructive' : ''}`}><SelectValue placeholder={field.placeholder ?? 'चुनें'} /></SelectTrigger>
              <SelectContent>{field.form_field_options.map(opt => <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          )}

          {field.field_type === 'radio' && field.form_field_options && (
            <RadioGroup value={values[field.field_key] ?? ''} onValueChange={v => setValues(p => ({ ...p, [field.field_key]: v }))} className="space-y-1.5">
              {field.form_field_options.map(opt => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={`${field.field_key}_${opt.value}`} />
                  <Label htmlFor={`${field.field_key}_${opt.value}`} className="font-normal cursor-pointer text-sm">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {field.field_type === 'checkbox' && field.form_field_options && (
            <div className="space-y-1.5">
              {field.form_field_options.map(opt => {
                const selected = (values[field.field_key] ?? '').split(',').filter(Boolean);
                return (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <Checkbox id={`${field.field_key}_${opt.value}`} checked={selected.includes(opt.value)} onCheckedChange={checked => {
                      const next = checked ? [...selected, opt.value] : selected.filter(v => v !== opt.value);
                      setValues(p => ({ ...p, [field.field_key]: next.join(',') }));
                    }} />
                    <Label htmlFor={`${field.field_key}_${opt.value}`} className="font-normal cursor-pointer text-sm">{opt.label}</Label>
                  </div>
                );
              })}
            </div>
          )}

          {errors[field.field_key] && <p className="text-xs text-destructive">{errors[field.field_key]}</p>}
        </div>
      ))}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('registration', 'submitting')}</> : t('registration', 'submitBtn')}
      </Button>
    </form>
  );
}
