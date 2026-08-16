'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Event, EventForm, FormField, FormFieldOption, FieldType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Loader2, Save, ChevronUp, ChevronDown, X,
} from 'lucide-react';
import { toast } from 'sonner';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file', label: 'File Upload' },
  { value: 'image', label: 'Image Upload' },
];

const HAS_OPTIONS: FieldType[] = ['dropdown', 'radio', 'checkbox'];

interface LocalField {
  id?: string;
  field_type: FieldType;
  field_key: string;
  label: string;
  description: string;
  placeholder: string;
  is_required: boolean;
  sort_order: number;
  options: { id?: string; label: string; value: string }[];
  isNew?: boolean;
}

export default function FormBuilderPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm | null>(null);
  const [fields, setFields] = useState<LocalField[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: ev } = await supabase.from('events').select('*').eq('id', eventId).single();
    setEvent(ev as Event);

    const { data: formData } = await supabase
      .from('event_forms')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (formData) {
      setForm(formData as EventForm);
      setFormTitle(formData.title);
      setFormDesc(formData.description ?? '');

      const { data: fieldsData } = await supabase
        .from('form_fields')
        .select('*, form_field_options(*)')
        .eq('form_id', formData.id)
        .order('sort_order');

      const mapped: LocalField[] = (fieldsData ?? []).map((f: FormField) => ({
        id: f.id,
        field_type: f.field_type,
        field_key: f.field_key,
        label: f.label,
        description: f.description ?? '',
        placeholder: f.placeholder ?? '',
        is_required: f.is_required,
        sort_order: f.sort_order,
        options: (f.form_field_options ?? []).map((o: FormFieldOption) => ({
          id: o.id,
          label: o.label,
          value: o.value,
        })),
      }));
      setFields(mapped);
    } else {
      setFormTitle(`${ev?.title ?? 'Event'} Registration`);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { loadData(); }, [loadData]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        field_type: 'text',
        field_key: `field_${Date.now()}`,
        label: '',
        description: '',
        placeholder: '',
        is_required: false,
        sort_order: prev.length,
        options: [],
        isNew: true,
      },
    ]);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, patch: Partial<LocalField>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    const arr = [...fields];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setFields(arr.map((f, i) => ({ ...f, sort_order: i })));
  };

  const addOption = (idx: number) => {
    const f = fields[idx];
    updateField(idx, {
      options: [...f.options, { label: '', value: '' }],
    });
  };

  const updateOption = (fieldIdx: number, optIdx: number, patch: { label?: string; value?: string }) => {
    const f = fields[fieldIdx];
    const opts = f.options.map((o, i) => (i === optIdx ? { ...o, ...patch } : o));
    updateField(fieldIdx, { options: opts });
  };

  const removeOption = (fieldIdx: number, optIdx: number) => {
    const f = fields[fieldIdx];
    updateField(fieldIdx, { options: f.options.filter((_, i) => i !== optIdx) });
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { toast.error('Form title is required.'); return; }
    setSaving(true);
    try {
      let formId = form?.id;

      // Upsert form
      if (!formId) {
        const { data, error } = await supabase
          .from('event_forms')
          .insert({ event_id: eventId, title: formTitle, description: formDesc || null, is_active: true })
          .select()
          .single();
        if (error) throw error;
        formId = data.id;
        setForm(data as EventForm);
      } else {
        const { error } = await supabase
          .from('event_forms')
          .update({ title: formTitle, description: formDesc || null })
          .eq('id', formId);
        if (error) throw error;
      }

      // Delete all existing fields and re-insert (simplest approach for reorder + edits)
      await supabase.from('form_fields').delete().eq('form_id', formId);

      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        if (!f.label.trim()) continue;

        const { data: fieldData, error: fieldErr } = await supabase
          .from('form_fields')
          .insert({
            form_id: formId,
            field_type: f.field_type,
            field_key: f.field_key || `field_${i}`,
            label: f.label.trim(),
            description: f.description.trim() || null,
            placeholder: f.placeholder.trim() || null,
            is_required: f.is_required,
            sort_order: i,
          })
          .select()
          .single();

        if (fieldErr) throw fieldErr;

        if (HAS_OPTIONS.includes(f.field_type) && f.options.length > 0) {
          const opts = f.options
            .filter((o) => o.label.trim())
            .map((o, j) => ({
              field_id: fieldData.id,
              label: o.label.trim(),
              value: o.value.trim() || o.label.trim().toLowerCase().replace(/\s+/g, '_'),
              sort_order: j,
            }));
          if (opts.length > 0) {
            const { error: optsErr } = await supabase.from('form_field_options').insert(opts);
            if (optsErr) throw optsErr;
          }
        }
      }

      toast.success('Form saved successfully.');
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save form.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={`/admin/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Link>
        <h1 className="text-2xl font-bold">Form Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">{event?.title}</p>
      </div>

      {/* Form meta */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Form Details</h2>
        <div className="space-y-2">
          <Label htmlFor="formTitle">Form Title <span className="text-destructive">*</span></Label>
          <Input id="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Registration Form Title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="formDesc">Form Description</Label>
          <Textarea id="formDesc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Instructions shown above the form..." rows={2} />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Form Fields ({fields.length})</h2>
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <p className="text-sm">No fields yet. Click "Add Field" to start building your form.</p>
          </div>
        )}

        {fields.map((field, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Field header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Field {idx + 1}</span>
                {field.is_required && (
                  <span className="text-xs text-destructive font-medium">Required</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => removeField(idx)} className="flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Field Type</Label>
                <Select value={field.field_type} onValueChange={(v) => updateField(idx, { field_type: v as FieldType, options: [] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Label <span className="text-destructive">*</span></Label>
                <Input value={field.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="Field label shown to user" />
              </div>
              <div className="space-y-1.5">
                <Label>Field Key</Label>
                <Input value={field.field_key} onChange={(e) => updateField(idx, { field_key: e.target.value.replace(/\s/g, '_') })} placeholder="auto_generated_key" />
              </div>
              {!HAS_OPTIONS.includes(field.field_type) && (
                <div className="space-y-1.5">
                  <Label>Placeholder</Label>
                  <Input value={field.placeholder} onChange={(e) => updateField(idx, { placeholder: e.target.value })} placeholder="Hint shown inside input" />
                </div>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description / Help Text</Label>
                <Input value={field.description} onChange={(e) => updateField(idx, { description: e.target.value })} placeholder="Optional helper text below the field" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" checked={field.is_required} onChange={(e) => updateField(idx, { is_required: e.target.checked })} />
              <span className="text-sm font-medium">Required field</span>
            </label>

            {/* Options for dropdown/radio/checkbox */}
            {HAS_OPTIONS.includes(field.field_type) && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <button onClick={() => addOption(idx)} className="text-xs text-primary hover:underline">
                    + Add Option
                  </button>
                </div>
                {field.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <Input value={opt.label} onChange={(e) => updateOption(idx, optIdx, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="Option label" className="flex-1" />
                    <Input value={opt.value} onChange={(e) => updateOption(idx, optIdx, { value: e.target.value })} placeholder="value" className="w-32 text-xs" />
                    <button onClick={() => removeOption(idx, optIdx)} className="shrink-0 h-8 w-8 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {field.options.length === 0 && (
                  <p className="text-xs text-muted-foreground">No options yet. Add at least one.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pb-8">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Form
        </Button>
        <Button variant="outline" onClick={addField}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>
    </div>
  );
}
