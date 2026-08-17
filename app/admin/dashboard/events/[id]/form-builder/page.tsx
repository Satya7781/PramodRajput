'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { events as eventsApi } from '@/lib/api-client';
import type { Event, FieldType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Loader2, Save, ChevronUp, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' }, { value: 'textarea', label: 'Textarea' },
  { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' }, { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' }, { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' }, { value: 'file', label: 'File Upload' },
  { value: 'image', label: 'Image Upload' },
];

const HAS_OPTIONS: FieldType[] = ['dropdown', 'radio', 'checkbox'];

interface LocalField {
  id?: string; field_type: FieldType; field_key: string; label: string;
  description: string; placeholder: string; is_required: boolean; sort_order: number;
  options: { id?: string; label: string; value: string }[];
  isNew?: boolean;
}

export default function FormBuilderPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [fields, setFields] = useState<LocalField[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ev = await eventsApi.getById(eventId);
      setEvent(ev);

      const formData = await eventsApi.getForm(eventId);
      if (formData && formData.form) {
        setFormTitle(formData.form.title ?? '');
        setFormDesc(formData.form.description ?? '');
        const mapped: LocalField[] = (formData.fields ?? []).map((f) => ({
          id: f.id, field_type: f.field_type, field_key: f.field_key, label: f.label,
          description: f.description ?? '', placeholder: f.placeholder ?? '',
          is_required: f.is_required, sort_order: f.sort_order,
          options: (f.form_field_options ?? []).map((o) => ({ id: o.id, label: o.label, value: o.value })),
        }));
        setFields(mapped);
      } else {
        setFormTitle(`${ev?.title ?? 'Event'} Registration`);
      }
    } catch (e) {
      toast.error('Failed to load form data.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { loadData(); }, [loadData]);

  const addField = () => {
    setFields((prev) => [...prev, {
      field_type: 'text', field_key: `field_${Date.now()}`, label: '',
      description: '', placeholder: '', is_required: false, sort_order: prev.length,
      options: [], isNew: true,
    }]);
  };

  const removeField = (idx: number) => setFields((prev) => prev.filter((_, i) => i !== idx));

  const updateField = (idx: number, patch: Partial<LocalField>) =>
    setFields((prev) => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));

  const moveField = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    const arr = [...fields];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setFields(arr.map((f, i) => ({ ...f, sort_order: i })));
  };

  const addOption = (idx: number) => updateField(idx, { options: [...fields[idx].options, { label: '', value: '' }] });

  const updateOption = (fieldIdx: number, optIdx: number, patch: { label?: string; value?: string }) => {
    const f = fields[fieldIdx];
    updateField(fieldIdx, { options: f.options.map((o, i) => i === optIdx ? { ...o, ...patch } : o) });
  };

  const removeOption = (fieldIdx: number, optIdx: number) => {
    updateField(fieldIdx, { options: fields[fieldIdx].options.filter((_, i) => i !== optIdx) });
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { toast.error('Form title is required.'); return; }
    for (const f of fields) {
      if (!f.label.trim()) { toast.error(`All fields must have a label.`); return; }
      if (!f.field_key.trim()) { toast.error(`All fields must have a key.`); return; }
      if (HAS_OPTIONS.includes(f.field_type) && f.options.length === 0) {
        toast.error(`"${f.label}" needs at least one option.`); return;
      }
    }

    setSaving(true);
    try {
      await eventsApi.saveForm(eventId, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        fields: fields.map((f, i) => ({
          ...f,
          sort_order: i,
          options: f.options.filter((o) => o.label.trim() && o.value.trim()),
        })),
      });
      toast.success('Form saved successfully!');
      loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save form.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/dashboard/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
          <h1 className="text-2xl font-bold">Form Builder</h1>
          {event && <p className="text-sm text-muted-foreground mt-1">{event.title}</p>}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Form
        </Button>
      </div>

      {/* Form meta */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Form Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Form Title <span className="text-destructive">*</span></Label>
            <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Registration Form" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Optional instructions for participants..." rows={2} />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Fields ({fields.length})</h2>
          <Button variant="outline" size="sm" onClick={addField}><Plus className="h-4 w-4 mr-2" />Add Field</Button>
        </div>

        {fields.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground text-sm">
            No fields yet. Click "Add Field" to start building the form.
          </div>
        )}

        {fields.map((field, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="rounded p-0.5 hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="rounded p-0.5 hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted rounded px-1.5 py-0.5">{idx + 1}</span>
              <span className="text-sm font-medium flex-1 truncate">{field.label || <span className="italic text-muted-foreground">Untitled field</span>}</span>
              <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">{field.field_type}</span>
              <button onClick={() => removeField(idx)} className="rounded p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Field Type</Label>
                <Select value={field.field_type} onValueChange={(v) => updateField(idx, { field_type: v as FieldType, options: HAS_OPTIONS.includes(v as FieldType) ? field.options : [] })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Label <span className="text-destructive">*</span></Label>
                <Input className="h-8 text-sm" value={field.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="Field label" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Field Key</Label>
                <Input className="h-8 text-sm" value={field.field_key} onChange={(e) => updateField(idx, { field_key: e.target.value })} placeholder="field_key" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Placeholder</Label>
                <Input className="h-8 text-sm" value={field.placeholder} onChange={(e) => updateField(idx, { placeholder: e.target.value })} placeholder="Optional hint text" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Input className="h-8 text-sm" value={field.description} onChange={(e) => updateField(idx, { description: e.target.value })} placeholder="Help text shown below field" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id={`required_${idx}`}
                  checked={field.is_required}
                  onChange={(e) => updateField(idx, { is_required: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor={`required_${idx}`} className="text-xs cursor-pointer">Required field</Label>
              </div>
            </div>

            {/* Options for dropdown/radio/checkbox */}
            {HAS_OPTIONS.includes(field.field_type) && (
              <div className="border-t border-border p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Options</Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addOption(idx)}>
                    <Plus className="h-3 w-3 mr-1" />Add Option
                  </Button>
                </div>
                {field.options.length === 0 && (
                  <p className="text-xs text-muted-foreground">Add at least one option.</p>
                )}
                {field.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex gap-2 items-center">
                    <Input className="h-7 text-xs" value={opt.label} onChange={(e) => updateOption(idx, optIdx, { label: e.target.value })} placeholder="Label" />
                    <Input className="h-7 text-xs" value={opt.value} onChange={(e) => updateOption(idx, optIdx, { value: e.target.value })} placeholder="Value" />
                    <button onClick={() => removeOption(idx, optIdx)} className="rounded p-1 hover:bg-destructive/10 hover:text-destructive shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Form
          </Button>
        </div>
      )}
    </div>
  );
}
