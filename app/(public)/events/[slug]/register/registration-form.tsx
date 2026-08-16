'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
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

interface RegistrationFormProps {
  eventId: string;
  formId: string;
  fields: FormField[];
}

export function RegistrationForm({ eventId, formId, fields }: RegistrationFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.is_required && !values[field.field_key]?.trim()) {
        newErrors[field.field_key] = `${field.label} is required`;
      }
      if (field.field_type === 'email' && values[field.field_key]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.field_key])) {
          newErrors[field.field_key] = 'Please enter a valid email address';
        }
      }
      if (field.field_type === 'phone' && values[field.field_key]) {
        if (!/^[+]?[\d\s-]{10,15}$/.test(values[field.field_key])) {
          newErrors[field.field_key] = 'Please enter a valid phone number';
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
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          form_id: formId,
          status: 'pending',
        })
        .select()
        .single();

      if (regError || !registration) {
        throw new Error(regError?.message || 'Failed to submit registration');
      }

      const valueInserts = fields
        .filter((f) => values[f.field_key])
        .map((field) => ({
          registration_id: registration.id,
          field_id: field.id,
          value_text: values[field.field_key],
        }));

      if (valueInserts.length > 0) {
        const { error: valuesError } = await supabase
          .from('registration_values')
          .insert(valueInserts);

        if (valuesError) throw new Error(valuesError.message);
      }

      setSuccess(registration.registration_number);
      toast.success('Registration submitted successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-scale-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 mb-6">
          <CheckCircle2 className="h-8 w-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
        <p className="text-muted-foreground mb-6">Your registration has been submitted and is pending review.</p>
        <div className="rounded-xl bg-muted p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Your Registration Number</p>
          <p className="text-2xl font-bold tracking-wider text-primary">{success}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Please save your registration number for future reference. You will be contacted with further details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.field_key}>
            {field.label}
            {field.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}

          {field.field_type === 'text' || field.field_type === 'email' || field.field_type === 'phone' || field.field_type === 'number' || field.field_type === 'date' ? (
            <Input
              id={field.field_key}
              type={field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : field.field_type === 'email' ? 'email' : field.field_type === 'date' ? 'date' : 'text'}
              placeholder={field.placeholder || ''}
              value={values[field.field_key] || ''}
              onChange={(e) => setValues({ ...values, [field.field_key]: e.target.value })}
            />
          ) : field.field_type === 'textarea' ? (
            <Textarea
              id={field.field_key}
              placeholder={field.placeholder || ''}
              value={values[field.field_key] || ''}
              onChange={(e) => setValues({ ...values, [field.field_key]: e.target.value })}
              rows={4}
            />
          ) : field.field_type === 'dropdown' ? (
            <Select
              value={values[field.field_key] || ''}
              onValueChange={(val) => setValues({ ...values, [field.field_key]: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.form_field_options?.map((opt) => (
                  <SelectItem key={opt.id} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.field_type === 'radio' ? (
            <RadioGroup
              value={values[field.field_key] || ''}
              onValueChange={(val) => setValues({ ...values, [field.field_key]: val })}
            >
              <div className="flex flex-col gap-2">
                {field.form_field_options?.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <RadioGroupItem id={`${field.field_key}-${opt.id}`} value={opt.value} />
                    <Label htmlFor={`${field.field_key}-${opt.id}`} className="font-normal cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : field.field_type === 'checkbox' ? (
            <div className="flex flex-col gap-2">
              {field.form_field_options?.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`${field.field_key}-${opt.id}`}
                    checked={values[field.field_key]?.includes(opt.value) || false}
                    onCheckedChange={(checked) => {
                      const current = values[field.field_key] ? values[field.field_key].split(',') : [];
                      const updated = checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value);
                      setValues({ ...values, [field.field_key]: updated.join(',') });
                    }}
                  />
                  <Label htmlFor={`${field.field_key}-${opt.id}`} className="font-normal cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          ) : field.field_type === 'file' || field.field_type === 'image' ? (
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <Input
                id={field.field_key}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setValues({ ...values, [field.field_key]: file.name });
                }}
              />
              <Label htmlFor={field.field_key} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                {values[field.field_key] || `Click to upload ${field.field_type === 'image' ? 'an image' : 'a file'}`}
              </Label>
            </div>
          ) : null}

          {errors[field.field_key] && (
            <p className="text-xs text-destructive">{errors[field.field_key]}</p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Registration'
        )}
      </Button>
    </form>
  );
}
