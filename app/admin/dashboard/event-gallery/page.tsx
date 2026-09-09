'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Plus, ChevronDown, ChevronUp, Trash2, Upload,
  ImageIcon, Video, X, Loader2, FolderOpen, CheckCircle2, AlertCircle, Pencil, Save
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getAuthToken } from '@/lib/api-client';
import { uploadToCloudinary, cloudinaryOptimized } from '@/lib/upload';

/* ─── Types ────────────────────────────────────────────────────── */
interface GalleryEvent {
  id: string; year: number; name: string; slug: string;
  description: string | null; cover_url: string | null;
  photo_count: string; video_count: string;
}
interface GalleryMedia {
  id: string; event_id: string; media_type: 'photo' | 'video';
  url: string; thumbnail: string | null; caption: string | null;
}

/* Per-file upload state */
type FileStatus = 'pending' | 'uploading' | 'done' | 'error';
interface QueueItem {
  id: string;           // local random id
  file: File;
  preview: string;      // object URL
  status: FileStatus;
  progress: string;
  cloudUrl: string;
  error: string;
}

const ALL_YEARS = Array.from({ length: 2026 - 2009 + 1 }, (_, i) => 2026 - i);
const MAX_FILES = 10;

function slugify(str: string) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');
}

/* ─── Main component ─────────────────────────────────────────── */
export default function EventGalleryAdminPage() {
  const { user } = useAuth();
  const token = getAuthToken();
  const authHeader = { Authorization: `Bearer ${token}` };

  const [openYear, setOpenYear]     = useState<number | null>(null);
  const [yearEvents, setYearEvents] = useState<Record<number, GalleryEvent[]>>({});
  const [loadingYear, setLoadingYear] = useState<number | null>(null);

  const [newEventYear, setNewEventYear] = useState<number | null>(null);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [savingEvent, setSavingEvent]   = useState(false);
  const [eventError, setEventError]     = useState('');

  const [openEventId, setOpenEventId]   = useState<string | null>(null);
  const [eventMedia, setEventMedia]     = useState<Record<string, GalleryMedia[]>>({});
  const [loadingMedia, setLoadingMedia] = useState<string | null>(null);

  /* ── Edit event ── */
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editName, setEditName]             = useState('');
  const [editSlug, setEditSlug]             = useState('');
  const [editDesc, setEditDesc]             = useState('');
  const [savingEdit, setSavingEdit]         = useState(false);
  const [editError, setEditError]           = useState('');

  /* ── Bulk photo queue ── */
  const [photoQueue, setPhotoQueue]     = useState<QueueItem[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkDone, setBulkDone]         = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ── Single video ── */
  const [videoUrl, setVideoUrl]           = useState('');
  const [videoCaption, setVideoCaption]   = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [savingVideo, setSavingVideo]     = useState(false);
  const [videoError, setVideoError]       = useState('');

  /* ─── Year / event loaders ─────────────────────────────────── */
  const loadYearEvents = async (year: number) => {
    if (yearEvents[year]) return;
    setLoadingYear(year);
    try {
      const data: GalleryEvent[] = await fetch(`/api/gallery-events?year=${year}`, { headers: authHeader }).then(r => r.json());
      setYearEvents(prev => ({ ...prev, [year]: Array.isArray(data) ? data : [] }));
    } finally { setLoadingYear(null); }
  };

  const toggleYear = (year: number) => {
    if (openYear === year) { setOpenYear(null); return; }
    setOpenYear(year); loadYearEvents(year); setNewEventYear(null);
  };

  const handleCreateEvent = async () => {
    if (!newEventYear || !newEventName.trim()) { setEventError('Name is required'); return; }
    setSavingEvent(true); setEventError('');
    try {
      const res = await fetch('/api/gallery-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ year: newEventYear, name: newEventName.trim(), slug: newEventSlug || slugify(newEventName), description: newEventDesc || null }),
      });
      const data = await res.json();
      if (!res.ok) { setEventError(data.error ?? 'Failed'); return; }
      setYearEvents(prev => {
        const existing = prev[newEventYear] ?? [];
        return { ...prev, [newEventYear]: [...existing, { ...data, photo_count: '0', video_count: '0' }] };
      });
      setNewEventName(''); setNewEventSlug(''); setNewEventDesc(''); setNewEventYear(null);
    } finally { setSavingEvent(false); }
  };

  const startEditEvent = (ev: GalleryEvent) => {
    setEditingEventId(ev.id);
    setEditName(ev.name);
    setEditSlug(ev.slug);
    setEditDesc(ev.description ?? '');
    setEditError('');
  };

  const cancelEdit = () => { setEditingEventId(null); setEditError(''); };

  const handleSaveEdit = async (ev: GalleryEvent, year: number) => {
    if (!editName.trim()) { setEditError('Name is required'); return; }
    setSavingEdit(true); setEditError('');
    try {
      const res = await fetch(`/api/gallery-events/${ev.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          year,
          name:        editName.trim(),
          slug:        editSlug.trim() || slugify(editName),
          description: editDesc.trim() || null,
          cover_url:   ev.cover_url,
          sort_order:  0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error ?? 'Failed to save'); return; }
      // Update local state
      setYearEvents(prev => ({
        ...prev,
        [year]: (prev[year] ?? []).map(e =>
          e.id === ev.id
            ? { ...e, name: data.name, slug: data.slug, description: data.description }
            : e
        ),
      }));
      setEditingEventId(null);
    } finally { setSavingEdit(false); }
  };

  const handleDeleteEvent = async (eventId: string, year: number) => {    if (!confirm('Delete this event and all its media?')) return;
    await fetch(`/api/gallery-events/${eventId}`, { method: 'DELETE', headers: authHeader });
    setYearEvents(prev => ({ ...prev, [year]: (prev[year] ?? []).filter(e => e.id !== eventId) }));
    if (openEventId === eventId) setOpenEventId(null);
  };

  const loadMedia = async (eventId: string) => {
    if (eventMedia[eventId]) return;
    setLoadingMedia(eventId);
    try {
      const data: GalleryMedia[] = await fetch(`/api/gallery-events/${eventId}/media`, { headers: authHeader }).then(r => r.json());
      setEventMedia(prev => ({ ...prev, [eventId]: Array.isArray(data) ? data : [] }));
    } finally { setLoadingMedia(null); }
  };

  const toggleEvent = (eventId: string) => {
    if (openEventId === eventId) { setOpenEventId(null); return; }
    setOpenEventId(eventId); loadMedia(eventId);
    setPhotoQueue([]); setBulkDone(false); setVideoUrl(''); setVideoCaption(''); setVideoError('');
  };

  const handleDeleteMedia = async (mediaId: string, eventId: string) => {
    await fetch(`/api/gallery-events/${eventId}/media?mediaId=${mediaId}`, { method: 'DELETE', headers: authHeader });
    setEventMedia(prev => ({ ...prev, [eventId]: (prev[eventId] ?? []).filter(m => m.id !== mediaId) }));
  };

  /* ─── Multi-file photo selection (up to 10) ──────────────── */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_FILES);
    if (!files.length) return;
    const items: QueueItem[] = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      status: 'pending',
      progress: '',
      cloudUrl: '',
      error: '',
    }));
    setPhotoQueue(items);
    setBulkDone(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const removeFromQueue = (id: string) => {
    setPhotoQueue(q => {
      const item = q.find(x => x.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return q.filter(x => x.id !== id);
    });
  };

  /* ─── Bulk upload to Cloudinary + save to DB ─────────────── */
  const handleBulkUpload = async () => {
    if (!openEventId || !token || photoQueue.length === 0) return;
    setBulkUploading(true);
    setBulkDone(false);

    // Upload each file to Cloudinary (parallel, max 3 concurrent)
    const uploadOne = async (item: QueueItem): Promise<QueueItem> => {
      setPhotoQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'uploading', progress: 'Uploading…' } : x));
      try {
        const result = await uploadToCloudinary(item.file, token, 'media');
        setPhotoQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'done', progress: 'Uploaded', cloudUrl: result.url } : x));
        return { ...item, status: 'done', cloudUrl: result.url };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed';
        setPhotoQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'error', progress: '', error: msg } : x));
        return { ...item, status: 'error', error: msg };
      }
    };

    // Chunk into groups of 3 for parallel upload
    const chunks: QueueItem[][] = [];
    for (let i = 0; i < photoQueue.length; i += 3) chunks.push(photoQueue.slice(i, i + 3));

    const allResults: QueueItem[] = [];
    for (const chunk of chunks) {
      const results = await Promise.all(chunk.map(uploadOne));
      allResults.push(...results);
    }

    // Save all successfully uploaded photos to DB
    const successful = allResults.filter(r => r.status === 'done' && r.cloudUrl);
    for (const item of successful) {
      try {
        const res = await fetch(`/api/gallery-events/${openEventId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({ media_type: 'photo', url: item.cloudUrl, caption: null }),
        });
        if (res.ok) {
          const saved = await res.json();
          setEventMedia(prev => ({ ...prev, [openEventId]: [...(prev[openEventId] ?? []), saved] }));
        }
      } catch { /* non-fatal */ }
    }

    // Update photo count in year events
    if (successful.length > 0) {
      setYearEvents(prev => {
        const updated = { ...prev };
        for (const yr of Object.keys(updated)) {
          updated[parseInt(yr)] = updated[parseInt(yr)].map(ev =>
            ev.id === openEventId
              ? { ...ev, photo_count: String(parseInt(ev.photo_count) + successful.length) }
              : ev
          );
        }
        return updated;
      });
    }

    setBulkUploading(false);
    setBulkDone(true);
  };

  const clearQueue = () => {
    photoQueue.forEach(item => { if (item.preview) URL.revokeObjectURL(item.preview); });
    setPhotoQueue([]);
    setBulkDone(false);
  };

  /* ─── Add single video ──────────────────────────────────── */
  const handleAddVideo = async () => {
    if (!openEventId || !videoUrl.trim()) { setVideoError('Video URL is required'); return; }
    setSavingVideo(true); setVideoError('');
    try {
      const res = await fetch(`/api/gallery-events/${openEventId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ media_type: 'video', url: videoUrl.trim(), caption: videoCaption || null, thumbnail: videoThumbnail || null }),
      });
      const data = await res.json();
      if (!res.ok) { setVideoError(data.error ?? 'Failed'); return; }
      setEventMedia(prev => ({ ...prev, [openEventId]: [...(prev[openEventId] ?? []), data] }));
      setYearEvents(prev => {
        const updated = { ...prev };
        for (const yr of Object.keys(updated)) {
          updated[parseInt(yr)] = updated[parseInt(yr)].map(ev =>
            ev.id === openEventId ? { ...ev, video_count: String(parseInt(ev.video_count) + 1) } : ev
          );
        }
        return updated;
      });
      setVideoUrl(''); setVideoCaption(''); setVideoThumbnail('');
    } finally { setSavingVideo(false); }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Event Gallery</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage year-wise events with photos and videos.</p>
      </div>

      <div className="space-y-3">
        {ALL_YEARS.map(year => {
          const events = yearEvents[year] ?? [];
          const isYearOpen = openYear === year;

          return (
            <div key={year} className={`rounded-xl border transition-all ${isYearOpen ? 'border-primary/40 shadow-md' : 'border-border'}`}>
              <button
                onClick={() => toggleYear(year)}
                className={`w-full flex items-center justify-between px-5 py-4 text-left rounded-xl transition-colors
                  ${isYearOpen ? 'bg-primary/5 rounded-b-none' : 'bg-card hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold tabular-nums ${isYearOpen ? 'text-primary' : ''}`}>{year}</span>
                  {isYearOpen && events.length > 0 && (
                    <span className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {isYearOpen ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {isYearOpen && (
                <div className="border-t border-border px-4 sm:px-5 py-4 space-y-4 bg-muted/10 rounded-b-xl">

                  {/* Add event form */}
                  <div className="rounded-lg border border-dashed border-border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" /> Add Event for {year}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Event name *"
                        value={newEventYear === year ? newEventName : ''}
                        onChange={e => { setNewEventYear(year); setNewEventName(e.target.value); setNewEventSlug(slugify(e.target.value)); }}
                        className="col-span-1 sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <input type="text" placeholder="Slug (auto-generated)"
                        value={newEventYear === year ? newEventSlug : ''}
                        onChange={e => { setNewEventYear(year); setNewEventSlug(e.target.value); }}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <input type="text" placeholder="Short description (optional)"
                        value={newEventYear === year ? newEventDesc : ''}
                        onChange={e => { setNewEventYear(year); setNewEventDesc(e.target.value); }}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    {eventError && newEventYear === year && <p className="text-xs text-destructive mt-2">{eventError}</p>}
                    <button onClick={() => { setNewEventYear(year); handleCreateEvent(); }} disabled={savingEvent}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {savingEvent && newEventYear === year ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Create Event
                    </button>
                  </div>

                  {loadingYear === year && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading events…
                    </div>
                  )}
                  {events.length === 0 && loadingYear !== year && (
                    <p className="text-sm text-muted-foreground">No events yet for {year}.</p>
                  )}

                  {events.map(ev => {
                    const isEvOpen = openEventId === ev.id;
                    const media = eventMedia[ev.id] ?? [];
                    const evPhotos = media.filter(m => m.media_type === 'photo');
                    const evVideos = media.filter(m => m.media_type === 'video');

                    return (
                      <div key={ev.id} className={`rounded-xl border transition-all ${isEvOpen ? 'border-primary/30' : 'border-border'}`}>
                        {/* Event header / edit form */}
                        {editingEventId === ev.id ? (
                          /* ── Inline edit form ── */
                          <div className="p-4 bg-primary/5 rounded-xl border border-primary/30 space-y-3">
                            <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                              <Pencil className="h-3.5 w-3.5" /> Edit Event
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Event name *"
                                value={editName}
                                onChange={e => { setEditName(e.target.value); setEditSlug(slugify(e.target.value)); }}
                                className="col-span-1 sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                              <input
                                type="text"
                                placeholder="Slug"
                                value={editSlug}
                                onChange={e => setEditSlug(e.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                              <input
                                type="text"
                                placeholder="Short description (optional)"
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>
                            {editError && <p className="text-xs text-destructive">{editError}</p>}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(ev, year)}
                                disabled={savingEdit}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── Normal event header ── */
                          <div className={`flex items-center gap-3 px-4 py-3 ${isEvOpen ? 'bg-primary/5 rounded-t-xl' : 'bg-card rounded-xl hover:bg-muted/40'} transition-colors`}>
                            <button onClick={() => toggleEvent(ev.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                              <FolderOpen className={`h-4 w-4 shrink-0 ${isEvOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm truncate block">{ev.name}</span>
                                {ev.description && <span className="text-xs text-muted-foreground truncate block">{ev.description}</span>}
                              </div>
                              <div className="flex gap-2 text-xs text-muted-foreground shrink-0">
                                <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />{ev.photo_count}</span>
                                <span className="flex items-center gap-1"><Video className="h-3 w-3" />{ev.video_count}</span>
                              </div>
                            </button>
                            <button
                              onClick={() => startEditEvent(ev)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit event"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, year)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => toggleEvent(ev.id)} className="p-1.5 text-muted-foreground">
                              {isEvOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        )}

                        {/* Media panel — only when not editing */}
                        {isEvOpen && editingEventId !== ev.id && (
                          <div className="border-t border-border p-4 space-y-6">
                            {loadingMedia === ev.id && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading media…
                              </div>
                            )}

                            {/* ── BULK PHOTO UPLOAD ── */}
                            <div className="rounded-xl border border-dashed border-border bg-background p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4 text-primary" /> Add Photos
                                </h4>
                                <span className="text-xs text-muted-foreground">Up to {MAX_FILES} at once</span>
                              </div>

                              {/* Drop zone / select button */}
                              {photoQueue.length === 0 ? (
                                <button
                                  onClick={() => photoInputRef.current?.click()}
                                  className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 py-8 transition-all group"
                                >
                                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    Click to select photos
                                  </span>
                                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP — max 10 files</span>
                                </button>
                              ) : (
                                <div className="space-y-3">
                                  {/* Preview grid */}
                                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {photoQueue.map(item => (
                                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group">
                                        <img src={item.preview} alt="" className="h-full w-full object-cover" />

                                        {/* Status overlay */}
                                        {item.status === 'uploading' && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                                          </div>
                                        )}
                                        {item.status === 'done' && (
                                          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                          </div>
                                        )}
                                        {item.status === 'error' && (
                                          <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center">
                                            <AlertCircle className="h-5 w-5 text-destructive" />
                                          </div>
                                        )}

                                        {/* Remove button — only before uploading */}
                                        {item.status === 'pending' && !bulkUploading && (
                                          <button
                                            onClick={() => removeFromQueue(item.id)}
                                            className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    {/* Add more button */}
                                    {photoQueue.length < MAX_FILES && !bulkUploading && !bulkDone && (
                                      <button
                                        onClick={() => photoInputRef.current?.click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 flex items-center justify-center transition-all hover:bg-primary/5"
                                      >
                                        <Plus className="h-5 w-5 text-muted-foreground" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Status summary */}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                      {photoQueue.filter(x => x.status === 'done').length} done ·{' '}
                                      {photoQueue.filter(x => x.status === 'uploading').length} uploading ·{' '}
                                      {photoQueue.filter(x => x.status === 'error').length} failed ·{' '}
                                      {photoQueue.filter(x => x.status === 'pending').length} pending
                                    </span>
                                    <span>{photoQueue.length}/{MAX_FILES}</span>
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex gap-2">
                                    {!bulkDone ? (
                                      <button
                                        onClick={handleBulkUpload}
                                        disabled={bulkUploading || photoQueue.every(x => x.status === 'done')}
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                      >
                                        {bulkUploading
                                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {photoQueue.filter(x => x.status === 'uploading').length} files…</>
                                          : <><Upload className="h-4 w-4" /> Upload {photoQueue.length} Photo{photoQueue.length !== 1 ? 's' : ''}</>}
                                      </button>
                                    ) : (
                                      <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2.5 text-sm font-semibold">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {photoQueue.filter(x => x.status === 'done').length} photos uploaded!
                                      </div>
                                    )}
                                    <button
                                      onClick={clearQueue}
                                      disabled={bulkUploading}
                                      className="rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Hidden file input — multiple */}
                              <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handlePhotoSelect}
                              />
                            </div>

                            {/* ── ADD VIDEO (single) ── */}
                            <div className="rounded-xl border border-dashed border-border bg-background p-4 space-y-3">
                              <h4 className="text-sm font-bold flex items-center gap-2">
                                <Video className="h-4 w-4 text-primary" /> Add Video
                              </h4>
                              <input type="text" placeholder="YouTube / video URL *"
                                value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input type="text" placeholder="Caption (optional)"
                                  value={videoCaption} onChange={e => setVideoCaption(e.target.value)}
                                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                <input type="text" placeholder="Thumbnail URL (optional)"
                                  value={videoThumbnail} onChange={e => setVideoThumbnail(e.target.value)}
                                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                              </div>
                              {videoError && <p className="text-xs text-destructive">{videoError}</p>}
                              <button onClick={handleAddVideo} disabled={savingVideo}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                {savingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Add Video
                              </button>
                            </div>

                            {/* ── Existing photos ── */}
                            {evPhotos.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <ImageIcon className="h-3.5 w-3.5" /> Photos ({evPhotos.length})
                                </h5>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {evPhotos.map(p => (
                                    <div key={p.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                      <img src={cloudinaryOptimized(p.url, 'w_200,h_200,c_fill,f_auto,q_auto')} alt={p.caption ?? ''} className="h-full w-full object-cover" loading="lazy" />
                                      <button onClick={() => handleDeleteMedia(p.id, ev.id)}
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive">
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ── Existing videos ── */}
                            {evVideos.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <Video className="h-3.5 w-3.5" /> Videos ({evVideos.length})
                                </h5>
                                <div className="space-y-2">
                                  {evVideos.map(v => (
                                    <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5">
                                      {v.thumbnail
                                        ? <img src={v.thumbnail} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                                        : <div className="h-10 w-16 rounded bg-muted flex items-center justify-center shrink-0"><Video className="h-4 w-4 text-muted-foreground" /></div>}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{v.caption || v.url}</p>
                                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{v.url}</a>
                                      </div>
                                      <button onClick={() => handleDeleteMedia(v.id, ev.id)}
                                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
