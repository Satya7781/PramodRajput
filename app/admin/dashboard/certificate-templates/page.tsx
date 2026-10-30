'use client';

import { useEffect, useState, useCallback } from 'react';
import { certificateTemplates as tmplApi, uploadFile } from '@/lib/api-client';
import type { CertificateTemplate, CertificateTemplateField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Loader2, FileImage, X, Save, Eye, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface TemplateField {
  field_key: string;
  label: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  font_family: string;
  font_size: number;
  font_weight: string;
  text_align: string;
  color: string;
}

interface FullTemplate extends CertificateTemplate {
  certificate_template_fields?: CertificateTemplateField[];
}

const DEFAULT_FIELD: TemplateField = {
  field_key: 'participant_name',
  label: 'Participant Name',
  x_position: 600,
  y_position: 425,
  width: 600,
  height: 60,
  font_family: 'Helvetica',
  font_size: 36,
  font_weight: 'bold',
  text_align: 'center',
  color: '#1a1a1a',
};

const FONT_FAMILIES = ['Helvetica', 'Times-Roman', 'Courier'];

function getPreviewValue(field: TemplateField): string {
  const normalizedKey = field.field_key.toLowerCase().replace(/[\s-]+/g, '_');
  const normalizedLabel = field.label.toLowerCase().replace(/[\s-]+/g, '_');
  if (normalizedKey === 'certificate_number' || normalizedLabel === 'certificate_number') {
    return 'PR-CERT-2026-000001';
  }
  if (
    ['participant_name', 'attendee_name', 'recipient_name', 'user_name', 'full_name', 'participant', 'attendee', 'recipient', 'user', 'name', 'name_field'].includes(normalizedKey) ||
    ['participant_name', 'attendee_name', 'recipient_name', 'user_name', 'full_name', 'participant', 'attendee', 'recipient', 'user', 'name', 'name_field'].includes(normalizedLabel) ||
    normalizedLabel.includes('name') ||
    (normalizedKey.includes('name') && ['participant', 'attendee', 'recipient', 'user'].some((prefix) => normalizedKey.includes(prefix))) ||
    (normalizedLabel.includes('name') && ['participant', 'attendee', 'recipient', 'user'].some((prefix) => normalizedLabel.includes(prefix)))
  ) {
    return 'Participant Name';
  }
  return field.label || 'Sample Text';
}

function TemplateFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: FullTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [backgroundUrl, setBackgroundUrl] = useState(initial?.background_url ?? '');
  const [width, setWidth] = useState(initial?.width ?? 1200);
  const [height, setHeight] = useState(initial?.height ?? 850);
  const [orientation, setOrientation] = useState(initial?.orientation ?? 'landscape');
  const [fields, setFields] = useState<TemplateField[]>(
    (initial?.certificate_template_fields ?? []).map((f) => ({
      field_key: f.field_key,
      label: f.label,
      x_position: f.x_position,
      y_position: f.y_position,
      width: f.width,
      height: f.height,
      font_family: f.font_family,
      font_size: f.font_size,
      font_weight: f.font_weight,
      text_align: f.text_align,
      color: f.color,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedField, setExpandedField] = useState<number | null>(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setBackgroundUrl(url);
      toast.success('Background image uploaded.');
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const addField = () => {
    setFields((prev) => [...prev, { ...DEFAULT_FIELD, field_key: `field_${Date.now()}`, label: 'New Field' }]);
    setExpandedField(fields.length);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
    setExpandedField(null);
  };

  const updateField = (idx: number, patch: Partial<TemplateField>) =>
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Template name is required.'); return; }
    if (!backgroundUrl) { toast.error('Please upload a background image.'); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), description: description.trim(), background_url: backgroundUrl, width, height, orientation, fields };
      if (isEdit) {
        await tmplApi.update(initial!.id, payload);
        toast.success('Template updated.');
      } else {
        await tmplApi.create(payload);
        toast.success('Template created.');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">{isEdit ? 'Edit Template' : 'New Certificate Template'}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Template Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Template Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Participation Certificate" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional description" />
              </div>
              <div className="space-y-1.5">
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape (A4)</SelectItem>
                    <SelectItem value="portrait">Portrait (A4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>Width (px)</Label>
                  <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Height (px)</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* Background upload */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Background Image</h3>
            <p className="text-xs text-muted-foreground">
              Upload the certificate background (PNG/JPG). Leave space where the participant&apos;s name and other text will be placed.
            </p>
            {backgroundUrl ? (
              <div className="relative rounded-xl border border-border overflow-hidden">
                <img src={backgroundUrl} alt="Certificate background" className="w-full h-48 object-contain bg-muted/30" />
                <button
                  onClick={() => setBackgroundUrl('')}
                  className="absolute top-2 right-2 rounded-full bg-background/80 border border-border p-1 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 cursor-pointer hover:border-primary/50 transition-colors">
                {uploading
                  ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  : <FileImage className="h-8 w-8 text-muted-foreground mb-2" />}
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Click to upload background image'}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Text fields positioning */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Text Fields</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure where text is placed on the certificate. Use <code className="bg-muted px-1 rounded">participant_name</code> for the recipient&apos;s name.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            </div>

            {fields.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No text fields. Add at least one for the participant name.
              </div>
            )}

            {fields.map((f, idx) => (
              <div key={idx} className="rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedField(expandedField === idx ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 text-left"
                >
                  {expandedField === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="text-sm font-medium flex-1">{f.label || 'Untitled field'}</span>
                  <span className="text-xs text-muted-foreground font-mono">{f.field_key}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeField(idx); }}
                    className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </button>

                {expandedField === idx && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Field Key</Label>
                      <Input className="h-8 text-sm" value={f.field_key} onChange={(e) => updateField(idx, { field_key: e.target.value })} placeholder="participant_name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Label</Label>
                      <Input className="h-8 text-sm" value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="Participant Name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="h-8 w-12 p-1 cursor-pointer" value={f.color} onChange={(e) => updateField(idx, { color: e.target.value })} />
                        <Input className="h-8 text-sm flex-1" value={f.color} onChange={(e) => updateField(idx, { color: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">X Position (px)</Label>
                      <Input type="number" className="h-8 text-sm" value={f.x_position} onChange={(e) => updateField(idx, { x_position: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Y Position (px)</Label>
                      <Input type="number" className="h-8 text-sm" value={f.y_position} onChange={(e) => updateField(idx, { y_position: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Font Size (pt)</Label>
                      <Input type="number" className="h-8 text-sm" value={f.font_size} onChange={(e) => updateField(idx, { font_size: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Font Family</Label>
                      <Select value={f.font_family} onValueChange={(v) => updateField(idx, { font_family: v })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((ff) => <SelectItem key={ff} value={ff}>{ff}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Font Weight</Label>
                      <Select value={f.font_weight} onValueChange={(v) => updateField(idx, { font_weight: v })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Text Align</Label>
                      <Select value={f.text_align} onValueChange={(v) => updateField(idx, { text_align: v })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Box Width (px)</Label>
                      <Input type="number" className="h-8 text-sm" value={f.width} onChange={(e) => updateField(idx, { width: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Box Height (px)</Label>
                      <Input type="number" className="h-8 text-sm" value={f.height} onChange={(e) => updateField(idx, { height: Number(e.target.value) })} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!backgroundUrl}>
            <Eye className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">Certificate Preview</h2>
                <p className="text-xs text-muted-foreground mt-1">Sample values are shown for configured fields.</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="rounded-lg p-1 hover:bg-muted" aria-label="Close preview">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div
                className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30"
                style={{ aspectRatio: `${width} / ${height}`, containerType: 'inline-size' }}
              >
                {backgroundUrl && <img src={backgroundUrl} alt="Certificate preview background" className="absolute inset-0 h-full w-full object-fill" />}
                {fields.map((field, index) => (
                  <div
                    key={`${field.field_key}-${index}`}
                    className="absolute overflow-hidden whitespace-nowrap"
                    style={{
                      left: `${(field.x_position / width) * 100}%`,
                      top: `${(field.y_position / height) * 100}%`,
                      width: `${(field.width / width) * 100}%`,
                      height: `${(field.height / height) * 100}%`,
                      color: field.color,
                      fontFamily: field.font_family,
                      fontWeight: field.font_weight,
                      textAlign: field.text_align as 'left' | 'center' | 'right',
                      fontSize: `${(field.font_size / width) * 100}cqw`,
                      lineHeight: 1.2,
                    }}
                  >
                    {getPreviewValue(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<FullTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<FullTemplate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tmplApi.listAll();
      setTemplates(data as FullTemplate[]);
    } catch {
      toast.error('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openEdit = async (t: FullTemplate) => {
    try {
      const res = await tmplApi.getById(t.id);
      const full: FullTemplate = {
        ...res.template,
        certificate_template_fields: res.fields,
      };
      setEditTarget(full);
      setShowModal(true);
    } catch {
      toast.error('Failed to load template details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete or deactivate this template?')) return;
    setDeleting(id);
    try {
      await tmplApi.remove(id);
      toast.success('Template removed.');
      fetchTemplates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Certificate Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage certificate templates. Upload a background image and configure where text fields are placed.
          </p>
        </div>
        <Button onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-14 text-center">
          <FileImage className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">No certificate templates yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Create one to start issuing certificates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="relative h-36 bg-muted/30">
                {t.background_url
                  ? <img src={t.background_url} alt={t.name} className="w-full h-full object-contain" />
                  : <div className="flex items-center justify-center h-full"><FileImage className="h-8 w-8 text-muted-foreground/30" /></div>}
                <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">{t.name}</h3>
                {t.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>}
                <p className="text-xs text-muted-foreground mt-2">{t.width} × {t.height}px · {t.orientation}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(t)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TemplateFormModal
          initial={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={fetchTemplates}
        />
      )}
    </div>
  );
}
