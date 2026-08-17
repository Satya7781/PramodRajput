'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { videos as videosApi, uploadFile } from '@/lib/api-client';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, X, Video as VideoIcon, Play, Upload } from 'lucide-react';
import { toast } from 'sonner';

type VideoStatus = 'published' | 'draft' | 'archived';

interface VideoForm {
  title: string; description: string; video_url: string;
  thumbnail_url: string; category: string; status: VideoStatus;
}

const EMPTY_FORM: VideoForm = { title: '', description: '', video_url: '', thumbnail_url: '', category: '', status: 'published' };

const STATUS_COLORS: Record<VideoStatus, string> = {
  published: 'bg-green-100 text-green-700', draft: 'bg-muted text-muted-foreground', archived: 'bg-amber-100 text-amber-700',
};

const CATEGORIES = ['Speech', 'Event', 'Interview', 'Community Work', 'Cultural', 'Other'];

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  return null;
}

export default function VideosAdminPage() {
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videosApi.list({ admin: true });
      setVideoList(data);
    } catch { toast.error('Failed to load videos.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (v: Video) => {
    setEditing(v);
    setForm({ title: v.title, description: v.description ?? '', video_url: v.video_url, thumbnail_url: v.thumbnail_url ?? '', category: v.category ?? '', status: v.status as VideoStatus });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  const setField = (k: keyof VideoForm, val: string) => {
    setForm((p) => {
      const next = { ...p, [k]: val };
      if (k === 'video_url' && !p.thumbnail_url) {
        const thumb = getYouTubeThumbnail(val);
        if (thumb) next.thumbnail_url = thumb;
      }
      return next;
    });
  };

  const handleThumbUpload = async (file: File) => {
    setUploadingThumb(true);
    try {
      const url = await uploadFile(file);
      setField('thumbnail_url', url);
      toast.success('Thumbnail uploaded.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploadingThumb(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.video_url.trim()) { toast.error('Title and video URL are required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), description: form.description.trim() || null,
      video_url: form.video_url.trim(),
      thumbnail_url: form.thumbnail_url.trim() || getYouTubeThumbnail(form.video_url) || null,
      category: form.category.trim() || null, status: form.status,
    };
    try {
      if (editing) { await videosApi.update(editing.id, payload); toast.success('Video updated.'); }
      else { await videosApi.create(payload); toast.success('Video added.'); }
      closeForm(); fetchVideos();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    setDeleting(id);
    try { await videosApi.remove(id); toast.success('Video deleted.'); fetchVideos(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Videos</h1><p className="text-sm text-muted-foreground mt-1">Manage video gallery entries.</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Video</Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editing ? 'Edit Video' : 'Add Video'}</h2>
            <button onClick={closeForm} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Video title" required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Video URL <span className="text-destructive">*</span></Label>
              <Input value={form.video_url} onChange={(e) => setField('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=... or embed URL" required />
              <p className="text-xs text-muted-foreground">YouTube thumbnails are auto-detected.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail</Label>
              <div className="flex gap-2">
                <Input value={form.thumbnail_url} onChange={(e) => setField('thumbnail_url', e.target.value)} placeholder="Auto-filled for YouTube" className="flex-1" />
                <input ref={thumbFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbUpload(f); e.target.value = ''; }} />
                <Button type="button" variant="outline" size="sm" onClick={() => thumbFileRef.current?.click()} disabled={uploadingThumb}>
                  {uploadingThumb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="Thumbnail" className="h-20 rounded-lg border border-border object-cover mt-1"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setField('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} placeholder="Optional description..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving || uploadingThumb}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Save Changes' : 'Add Video'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : videoList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <VideoIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />No videos yet. Add your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoList.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-card overflow-hidden group">
              <div className="relative aspect-video bg-muted">
                {v.thumbnail_url
                  ? <img src={v.thumbnail_url} alt={v.title} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center"><Play className="h-10 w-10 text-muted-foreground opacity-40" /></div>}
                {v.category && <span className="absolute top-2 left-2 rounded-full bg-black/60 text-white text-xs px-2 py-0.5">{v.category}</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{v.title}</p>
                    {v.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{v.description}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[v.status as VideoStatus]}`}>{v.status}</span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <button onClick={() => openEdit(v)} className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                    {deleting === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
