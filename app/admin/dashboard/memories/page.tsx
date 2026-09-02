'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { memories as memoriesApi, uploadFile } from '@/lib/api-client';
import type { EventMemory, MemoryPhoto, MemoryVideo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Loader2, X, BookOpen,
  ChevronDown, ChevronUp, Upload, ImageIcon, Play,
  Calendar, MapPin, Camera, Video as VideoIcon, Languages,
} from 'lucide-react';
import { formatDate, slugify } from '@/lib/date-utils';
import { toast } from 'sonner';
import { useAutoTranslate } from '@/lib/use-translate';

// ─── Types ────────────────────────────────────────────────────────────────────

type MemStatus = 'draft' | 'published' | 'archived';

interface MemoryForm {
  title: string;
  slug: string;
  event_date: string;
  location: string;
  description: string;
  cover_image_url: string;
  status: MemStatus;
  title_en: string;
  description_en: string;
}

const EMPTY: MemoryForm = {
  title: '', slug: '', event_date: '', location: '',
  description: '', cover_image_url: '', status: 'published',
  title_en: '', description_en: '',
};

interface MemoryWithMedia extends EventMemory {
  memory_photos?: MemoryPhoto[];
  memory_videos?: MemoryVideo[];
  photo_count?: number;
  video_count?: number;
}

// ─── YouTube thumbnail helper ─────────────────────────────────────────────────
function ytThumb(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MemoriesAdminPage() {
  const [list, setList]             = useState<MemoryWithMedia[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  // Form state
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<EventMemory | null>(null);
  const [form, setForm]             = useState<MemoryForm>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Expanded media panel
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [mediaData, setMediaData]   = useState<Record<string, { photos: MemoryPhoto[]; videos: MemoryVideo[] }>>({});
  const [deleting, setDeleting]     = useState<string | null>(null);

  // Photo upload
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Video add
  const [videoUrl, setVideoUrl]     = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);

  // Auto-translate hook
  const { autoTranslate, translating } = useAutoTranslate();

  // ─── Data fetch ─────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memoriesApi.list({ admin: true, search: search || undefined });
      setList(data as MemoryWithMedia[]);
    } catch { toast.error('Failed to load memories.'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ─── Form helpers ────────────────────────────────────────────────────────────
  const set = (k: keyof MemoryForm, v: string) =>
    setForm(p => ({ ...p, [k]: v, ...(k === 'title' && !editing ? { slug: slugify(v) } : {}) }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit   = (m: EventMemory) => {
    setEditing(m);
    setForm({
      title: m.title, slug: m.slug,
      event_date: m.event_date?.slice(0, 10) ?? '',
      location: m.location ?? '',
      description: m.description ?? '',
      cover_image_url: m.cover_image_url ?? '',
      status: m.status as MemStatus,
      title_en: (m as any).title_en ?? '',
      description_en: (m as any).description_en ?? '',
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  // ─── Cover image upload ──────────────────────────────────────────────────────
  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      set('cover_image_url', url);
      toast.success('Cover image uploaded.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploadingCover(false); }
  };

  // ─── Save memory ─────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim())      { toast.error('Title is required.'); return; }
    if (!form.slug.trim())       { toast.error('Slug is required.'); return; }
    if (!form.event_date)        { toast.error('Event date is required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), slug: form.slug.trim(),
      event_date: form.event_date, location: form.location.trim() || null,
      description: form.description.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      status: form.status,
      title_en: form.title_en.trim() || null,
      description_en: form.description_en.trim() || null,
    };
    try {
      if (editing) {
        await memoriesApi.update(editing.id, payload);
        toast.success('Memory updated.');
      } else {
        await memoriesApi.create(payload);
        toast.success('Memory created.');
      }
      closeForm(); fetchList();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  // ─── Delete memory ───────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory and all its photos & videos? This cannot be undone.')) return;
    setDeleting(id);
    try { await memoriesApi.remove(id); toast.success('Memory deleted.'); fetchList(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setDeleting(null); }
  };

  // ─── Expand / load media ─────────────────────────────────────────────────────
  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (mediaData[id]) return; // already loaded
    try {
      const full = await memoriesApi.getById(id);
      setMediaData(prev => ({
        ...prev,
        [id]: {
          photos: (full as MemoryWithMedia).memory_photos ?? [],
          videos: (full as MemoryWithMedia).memory_videos ?? [],
        },
      }));
    } catch { toast.error('Failed to load media.'); }
  };

  const refreshMedia = async (id: string) => {
    const full = await memoriesApi.getById(id);
    setMediaData(prev => ({
      ...prev,
      [id]: {
        photos: (full as MemoryWithMedia).memory_photos ?? [],
        videos: (full as MemoryWithMedia).memory_videos ?? [],
      },
    }));
    // also refresh counts in list
    fetchList();
  };

  // ─── Photo upload ─────────────────────────────────────────────────────────────
  const handlePhotoUpload = async (memoryId: string, file: File) => {
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file);
      await memoriesApi.addPhoto(memoryId, { image_url: url, caption: photoCaption.trim() || undefined });
      toast.success('Photo added.');
      setPhotoCaption('');
      await refreshMedia(memoryId);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploadingPhoto(false); }
  };

  const removePhoto = async (memoryId: string, photoId: string) => {
    try {
      await memoriesApi.removePhoto(memoryId, photoId);
      toast.success('Photo removed.');
      await refreshMedia(memoryId);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
  };

  // ─── Video add ────────────────────────────────────────────────────────────────
  const handleAddVideo = async (memoryId: string) => {
    if (!videoUrl.trim()) { toast.error('Video URL is required.'); return; }
    setAddingVideo(true);
    try {
      await memoriesApi.addVideo(memoryId, {
        video_url: videoUrl.trim(),
        title: videoTitle.trim() || undefined,
      });
      toast.success('Video added.');
      setVideoUrl(''); setVideoTitle('');
      await refreshMedia(memoryId);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setAddingVideo(false); }
  };

  const removeVideo = async (memoryId: string, videoId: string) => {
    try {
      await memoriesApi.removeVideo(memoryId, videoId);
      toast.success('Video removed.');
      await refreshMedia(memoryId);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
  };

  const STATUS_COLORS: Record<MemStatus, string> = {
    published: 'bg-green-100 text-green-700',
    draft:     'bg-muted text-muted-foreground',
    archived:  'bg-amber-100 text-amber-700',
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Past Event Memories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Document and preserve memories from past events — attach photos and videos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Memory
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by title, location, description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72"
        />
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">
              {editing ? 'Edit Memory' : 'New Memory'}
            </h2>
            <button onClick={closeForm} className="rounded p-1 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <Label>Event Title <span className="text-destructive">*</span></Label>
              <Input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. जनपद पंचायत वार्षिक खेल महोत्सव 2023"
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="flex items-center gap-1.5">Event Title <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-semibold">EN</span></Label>
              <Input
                value={form.title_en}
                onChange={e => set('title_en', e.target.value)}
                placeholder="e.g. Janpad Panchayat Annual Sports Meet 2023 (optional)"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label>URL Slug <span className="text-destructive">*</span></Label>
              <Input
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="sports-meet-2023"
                required
              />
              <p className="text-xs text-muted-foreground">URL: /memories/<strong>{form.slug || 'slug'}</strong></p>
            </div>

            {/* Event date */}
            <div className="space-y-1.5">
              <Label>Event Date <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={form.event_date}
                onChange={e => set('event_date', e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label>Location / Venue</Label>
              <Input
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Fanda Kala, Bhopal"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cover image */}
            <div className="space-y-1.5 md:col-span-2">
              <Label>Cover Image</Label>
              <div className="flex gap-2">
                <Input
                  value={form.cover_image_url}
                  onChange={e => set('cover_image_url', e.target.value)}
                  placeholder="Paste URL or upload a file"
                  className="flex-1"
                />
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleCoverUpload(f);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverFileRef.current?.click()}
                  disabled={uploadingCover}
                >
                  {uploadingCover
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {form.cover_image_url && (
                <img
                  src={form.cover_image_url}
                  alt="Cover preview"
                  className="h-28 w-full object-cover rounded-lg border border-border mt-1"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Write about what happened at this event (Hindi)…"
                rows={5}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="flex items-center gap-1.5">Description <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-semibold">EN</span></Label>
              <Textarea
                value={form.description_en}
                onChange={e => set('description_en', e.target.value)}
                placeholder="Write about what happened at this event (English, optional)…"
                rows={5}
              />
            </div>
            {/* Auto-translate */}
            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={translating}
                onClick={async () => {
                  const [t1, t2] = await autoTranslate([form.title, form.description]);
                  if (t1 && !form.title_en.trim())       set('title_en', t1);
                  if (t2 && !form.description_en.trim()) set('description_en', t2);
                }}
              >
                {translating
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Translating…</>
                  : <><Languages className="h-4 w-4 mr-2" />Auto-translate Hindi → English</>}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Fills English fields automatically using MyMemory (free). You can edit before saving.
              </p>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving || uploadingCover}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Memory'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium mb-1">No memories yet</p>
          <p className="text-sm">Start documenting past events by clicking "Add Memory".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(memory => {
            const media = mediaData[memory.id];
            const isExpanded = expanded === memory.id;

            return (
              <div key={memory.id} className="rounded-xl border border-border bg-card overflow-hidden">

                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Cover thumbnail */}
                  <div className="h-16 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {memory.cover_image_url
                      ? <img src={memory.cover_image_url} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground opacity-40" />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{memory.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[memory.status as MemStatus]}`}>
                        {memory.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {memory.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(memory.event_date)}
                        </span>
                      )}
                      {memory.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {memory.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {memory.photo_count ?? 0} photos
                      </span>
                      <span className="flex items-center gap-1">
                        <VideoIcon className="h-3 w-3" />
                        {memory.video_count ?? 0} videos
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleExpand(memory.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                      title="Manage photos & videos"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(memory)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      disabled={deleting === memory.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      {deleting === memory.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Media panel */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-5 space-y-6">

                    {/* ── Photos section ── */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" />
                        Photos
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          {media?.photos.length ?? 0}
                        </span>
                      </h3>

                      {/* Upload row */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <Input
                          value={photoCaption}
                          onChange={e => setPhotoCaption(e.target.value)}
                          placeholder="Caption (optional)"
                          className="w-44 h-8 text-sm"
                        />
                        <input
                          ref={photoFileRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? []);
                            for (const file of files) await handlePhotoUpload(memory.id, file);
                            e.target.value = '';
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => photoFileRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                          Upload Photo(s)
                        </Button>
                      </div>

                      {/* Photo grid */}
                      {media?.photos && media.photos.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
                          {media.photos.map(photo => (
                            <div
                              key={photo.id}
                              className="group relative aspect-square rounded-lg overflow-hidden border border-border"
                            >
                              <img
                                src={photo.image_url}
                                alt={photo.caption ?? ''}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => removePhoto(memory.id, photo.id)}
                                  className="rounded-full bg-destructive/90 p-1.5 text-white"
                                  title="Remove photo"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {photo.caption && (
                                <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1 truncate">
                                  {photo.caption}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No photos yet. Upload some above.</p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border" />

                    {/* ── Videos section ── */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <VideoIcon className="h-4 w-4 text-primary" />
                        Videos
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          {media?.videos.length ?? 0}
                        </span>
                      </h3>

                      {/* Add video row */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <Input
                          value={videoUrl}
                          onChange={e => setVideoUrl(e.target.value)}
                          placeholder="YouTube or video URL *"
                          className="flex-1 min-w-48 h-8 text-sm"
                        />
                        <Input
                          value={videoTitle}
                          onChange={e => setVideoTitle(e.target.value)}
                          placeholder="Video title (optional)"
                          className="w-44 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddVideo(memory.id)}
                          disabled={addingVideo || !videoUrl.trim()}
                        >
                          {addingVideo
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                          Add Video
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        YouTube thumbnails are auto-detected.
                      </p>

                      {/* Video grid */}
                      {media?.videos && media.videos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {media.videos.map(video => (
                            <div
                              key={video.id}
                              className="group relative rounded-lg overflow-hidden border border-border bg-muted"
                            >
                              <div className="aspect-video relative">
                                {video.thumbnail_url
                                  ? <img src={video.thumbnail_url} alt={video.title ?? ''} className="h-full w-full object-cover" />
                                  : <div className="h-full w-full flex items-center justify-center">
                                      <Play className="h-8 w-8 text-muted-foreground opacity-40" />
                                    </div>
                                }
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                  <a
                                    href={video.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full bg-white/90 p-2"
                                    title="Open video"
                                  >
                                    <Play className="h-4 w-4 text-primary fill-primary" />
                                  </a>
                                </div>
                              </div>
                              <div className="p-2 flex items-start justify-between gap-1">
                                <p className="text-xs font-medium line-clamp-1 flex-1">
                                  {video.title || 'Video'}
                                </p>
                                <button
                                  onClick={() => removeVideo(memory.id, video.id)}
                                  className="shrink-0 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  title="Remove video"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No videos yet. Add a link above.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
