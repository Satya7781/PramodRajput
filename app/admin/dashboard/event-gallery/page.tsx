'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus, ChevronDown, ChevronUp, Trash2, Upload,
  ImageIcon, Video, X, Loader2, FolderOpen
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { uploadToCloudinary, cloudinaryOptimized } from '@/lib/upload';

interface GalleryEvent {
  id: string;
  year: number;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  photo_count: string;
  video_count: string;
}

interface GalleryMedia {
  id: string;
  event_id: string;
  media_type: 'photo' | 'video';
  url: string;
  thumbnail: string | null;
  caption: string | null;
}

const ALL_YEARS = Array.from({ length: 2026 - 2009 + 1 }, (_, i) => 2026 - i);

function slugify(str: string) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');
}

export default function EventGalleryAdminPage() {
  const { token } = useAuth();
  const authHeader = { Authorization: `Bearer ${token}` };

  // Year accordion
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [yearEvents, setYearEvents] = useState<Record<number, GalleryEvent[]>>({});
  const [loadingYear, setLoadingYear] = useState<number | null>(null);

  // New event form
  const [newEventYear, setNewEventYear] = useState<number | null>(null);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventError, setEventError] = useState('');

  // Open event for media management
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [eventMedia, setEventMedia] = useState<Record<string, GalleryMedia[]>>({});
  const [loadingMedia, setLoadingMedia] = useState<string | null>(null);

  // Media upload
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState('');

  // File upload — now via Cloudinary direct upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const loadYearEvents = async (year: number) => {
    if (yearEvents[year]) return;
    setLoadingYear(year);
    try {
      const data: GalleryEvent[] = await fetch(`/api/gallery-events?year=${year}`, { headers: authHeader }).then(r => r.json());
      setYearEvents(prev => ({ ...prev, [year]: data }));
    } finally {
      setLoadingYear(null);
    }
  };

  const toggleYear = (year: number) => {
    if (openYear === year) { setOpenYear(null); return; }
    setOpenYear(year);
    loadYearEvents(year);
    setNewEventYear(null);
  };

  const handleCreateEvent = async () => {
    if (!newEventYear || !newEventName.trim()) { setEventError('Name is required'); return; }
    setSavingEvent(true); setEventError('');
    try {
      const res = await fetch('/api/gallery-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          year: newEventYear,
          name: newEventName.trim(),
          slug: newEventSlug || slugify(newEventName),
          description: newEventDesc || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEventError(data.error ?? 'Failed to create'); return; }
      // Refresh year events
      setYearEvents(prev => {
        const existing = prev[newEventYear] ?? [];
        return { ...prev, [newEventYear]: [...existing, { ...data, photo_count: '0', video_count: '0' }] };
      });
      setNewEventName(''); setNewEventSlug(''); setNewEventDesc(''); setNewEventYear(null);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, year: number) => {
    if (!confirm('Delete this event and all its media?')) return;
    await fetch(`/api/gallery-events/${eventId}`, { method: 'DELETE', headers: authHeader });
    setYearEvents(prev => ({
      ...prev,
      [year]: (prev[year] ?? []).filter(e => e.id !== eventId),
    }));
    if (openEventId === eventId) setOpenEventId(null);
  };

  const loadMedia = async (eventId: string) => {
    if (eventMedia[eventId]) return;
    setLoadingMedia(eventId);
    try {
      const data: GalleryMedia[] = await fetch(`/api/gallery-events/${eventId}/media`, { headers: authHeader }).then(r => r.json());
      setEventMedia(prev => ({ ...prev, [eventId]: data }));
    } finally {
      setLoadingMedia(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    if (openEventId === eventId) { setOpenEventId(null); return; }
    setOpenEventId(eventId);
    loadMedia(eventId);
    setUploadUrl(''); setUploadCaption(''); setUploadThumbnail(''); setMediaError('');
  };

  // Upload a file directly to Cloudinary from the browser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !openEventId || !token) return;
    setUploadingFile(true);
    setUploadProgress('Uploading to Cloudinary…');
    setMediaError('');
    try {
      const result = await uploadToCloudinary(file, token, 'media');
      setUploadUrl(result.url);
      setUploadProgress('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setMediaError(msg);
      setUploadProgress('');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddMedia = async () => {
    if (!openEventId || !uploadUrl.trim()) { setMediaError('URL is required'); return; }
    setUploadingMedia(true); setMediaError('');
    try {
      const res = await fetch(`/api/gallery-events/${openEventId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          media_type: uploadType,
          url: uploadUrl.trim(),
          caption: uploadCaption || null,
          thumbnail: uploadThumbnail || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMediaError(data.error ?? 'Failed'); return; }
      setEventMedia(prev => ({ ...prev, [openEventId]: [...(prev[openEventId] ?? []), data] }));
      // Update counts in yearEvents
      setYearEvents(prev => {
        const updated = { ...prev };
        for (const yr of Object.keys(updated)) {
          updated[parseInt(yr)] = updated[parseInt(yr)].map(ev =>
            ev.id === openEventId
              ? { ...ev, [uploadType === 'photo' ? 'photo_count' : 'video_count']: String(parseInt(ev[uploadType === 'photo' ? 'photo_count' : 'video_count']) + 1) }
              : ev
          );
        }
        return updated;
      });
      setUploadUrl(''); setUploadCaption(''); setUploadThumbnail('');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string, eventId: string) => {
    await fetch(`/api/gallery-events/${eventId}/media?mediaId=${mediaId}`, { method: 'DELETE', headers: authHeader });
    setEventMedia(prev => ({
      ...prev,
      [eventId]: (prev[eventId] ?? []).filter(m => m.id !== mediaId),
    }));
  };

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
              {/* Year header */}
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
                      <input
                        type="text"
                        placeholder="Event name *"
                        value={newEventYear === year ? newEventName : ''}
                        onChange={e => { setNewEventYear(year); setNewEventName(e.target.value); setNewEventSlug(slugify(e.target.value)); }}
                        className="col-span-1 sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <input
                        type="text"
                        placeholder="Slug (auto-generated)"
                        value={newEventYear === year ? newEventSlug : ''}
                        onChange={e => { setNewEventYear(year); setNewEventSlug(e.target.value); }}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <input
                        type="text"
                        placeholder="Short description (optional)"
                        value={newEventYear === year ? newEventDesc : ''}
                        onChange={e => { setNewEventYear(year); setNewEventDesc(e.target.value); }}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    {eventError && newEventYear === year && (
                      <p className="text-xs text-destructive mt-2">{eventError}</p>
                    )}
                    <button
                      onClick={() => { setNewEventYear(year); handleCreateEvent(); }}
                      disabled={savingEvent}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {savingEvent && newEventYear === year ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Create Event
                    </button>
                  </div>

                  {/* Loading */}
                  {loadingYear === year && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading events…
                    </div>
                  )}

                  {/* Events list */}
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
                        {/* Event header */}
                        <div className={`flex items-center gap-3 px-4 py-3 ${isEvOpen ? 'bg-primary/5 rounded-t-xl' : 'bg-card rounded-xl hover:bg-muted/40'} transition-colors`}>
                          <button onClick={() => toggleEvent(ev.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                            <FolderOpen className={`h-4 w-4 shrink-0 ${isEvOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-medium text-sm truncate">{ev.name}</span>
                            <div className="flex gap-2 text-xs text-muted-foreground ml-auto shrink-0">
                              <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />{ev.photo_count}</span>
                              <span className="flex items-center gap-1"><Video className="h-3 w-3" />{ev.video_count}</span>
                            </div>
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

                        {/* Media panel */}
                        {isEvOpen && (
                          <div className="border-t border-border p-4 space-y-5">
                            {loadingMedia === ev.id && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading media…
                              </div>
                            )}

                            {/* Add media form */}
                            <div className="rounded-lg border border-dashed border-border bg-background p-4">
                              <h4 className="text-sm font-semibold mb-3">Add Media</h4>
                              <div className="flex gap-2 mb-3">
                                <button
                                  onClick={() => setUploadType('photo')}
                                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors
                                    ${uploadType === 'photo' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                                >
                                  <ImageIcon className="h-3.5 w-3.5" /> Photo
                                </button>
                                <button
                                  onClick={() => setUploadType('video')}
                                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors
                                    ${uploadType === 'video' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                                >
                                  <Video className="h-3.5 w-3.5" /> Video
                                </button>
                              </div>

                              <div className="space-y-2">
                                {/* URL input + file upload */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder={uploadType === 'photo' ? 'Cloudinary URL or upload a file' : 'YouTube / video URL or upload a file'}
                                    value={uploadUrl}
                                    onChange={e => setUploadUrl(e.target.value)}
                                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  />
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={uploadType === 'photo' ? 'image/*' : 'video/*,image/*'}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                  />
                                  <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium hover:bg-muted/80 disabled:opacity-50 shrink-0"
                                  >
                                    {uploadingFile
                                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      : <Upload className="h-3.5 w-3.5" />}
                                    Upload
                                  </button>
                                </div>
                                {uploadProgress && (
                                  <p className="text-xs text-primary flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" /> {uploadProgress}
                                  </p>
                                )}
                                {/* Preview uploaded image */}
                                {uploadUrl && uploadType === 'photo' && uploadUrl.includes('cloudinary.com') && (
                                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
                                    <img
                                      src={cloudinaryOptimized(uploadUrl, 'w_200,h_200,c_fill,f_auto,q_auto')}
                                      alt="Preview"
                                      className="h-full w-full object-cover"
                                    />
                                    <button
                                      onClick={() => setUploadUrl('')}
                                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                <input
                                  type="text"
                                  placeholder="Caption (optional)"
                                  value={uploadCaption}
                                  onChange={e => setUploadCaption(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                {uploadType === 'video' && (
                                  <input
                                    type="text"
                                    placeholder="Thumbnail URL (optional)"
                                    value={uploadThumbnail}
                                    onChange={e => setUploadThumbnail(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  />
                                )}
                              </div>
                              {mediaError && <p className="text-xs text-destructive mt-2">{mediaError}</p>}
                              <button
                                onClick={handleAddMedia}
                                disabled={uploadingMedia}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                {uploadingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Add {uploadType === 'photo' ? 'Photo' : 'Video'}
                              </button>
                            </div>

                            {/* Photo grid */}
                            {evPhotos.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <ImageIcon className="h-3.5 w-3.5" /> Photos ({evPhotos.length})
                                </h5>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                  {evPhotos.map(p => (
                                    <div key={p.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                      <img
                                        src={cloudinaryOptimized(p.url, 'w_200,h_200,c_fill,f_auto,q_auto')}
                                        alt={p.caption ?? ''}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                      <button
                                        onClick={() => handleDeleteMedia(p.id, ev.id)}
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Video list */}
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
                                        : <div className="h-10 w-16 rounded bg-muted flex items-center justify-center shrink-0"><Video className="h-4 w-4 text-muted-foreground" /></div>
                                      }
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{v.caption || v.url}</p>
                                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{v.url}</a>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteMedia(v.id, ev.id)}
                                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                      >
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
