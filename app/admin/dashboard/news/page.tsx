'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { news as newsApi, getAuthToken } from '@/lib/api-client';
import { uploadToCloudinary } from '@/lib/upload';
import type { News, NewsCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Loader2, X, Newspaper, Upload,
  ImageIcon, Languages, Video, Link as LinkIcon,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { formatDateTime, slugify } from '@/lib/date-utils';
import { toast } from 'sonner';
import { useAutoTranslate } from '@/lib/use-translate';
import { useLanguage } from '@/lib/i18n';

type NewsStatus = 'draft' | 'published' | 'archived';
type MediaType  = 'photo' | 'video' | 'link';

interface NewsForm {
  title: string; slug: string; excerpt: string; content: string;
  featured_image_url: string; category_id: string; status: NewsStatus;
  title_en: string; excerpt_en: string; content_en: string;
}
interface NewsMedia {
  id: string; news_id: string; media_type: MediaType;
  url: string; caption: string | null;
}
type FileStatus = 'pending' | 'uploading' | 'done' | 'error';
interface QueueItem { id: string; file: File; preview: string; status: FileStatus; cloudUrl: string; error: string; }

const EMPTY_FORM: NewsForm = {
  title: '', slug: '', excerpt: '', content: '',
  featured_image_url: '', category_id: '', status: 'draft',
  title_en: '', excerpt_en: '', content_en: '',
};
const STATUS_COLORS: Record<NewsStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};
const MAX_PHOTOS = 10;

function getVideoEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt[1]}` };
  const fb = url.match(/facebook\.com\/.*\/videos\/(\d+)|facebook\.com\/video\.php\?v=(\d+)|fb\.watch\/([^/]+)/);
  if (fb) return { type: 'facebook', url };
  return { type: 'other', url };
}

export default function NewsAdminPage() {
  const [articles, setArticles]   = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<News | null>(null);
  const [form, setForm]           = useState<NewsForm>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const bulkInputRef              = useRef<HTMLInputElement>(null);
  const { autoTranslate, translating } = useAutoTranslate();
  const { lang } = useLanguage();
  const token = getAuthToken();

  /* ── Media panel per article ── */
  const [mediaArticleId, setMediaArticleId] = useState<string | null>(null);
  const [articleMedia, setArticleMedia]     = useState<NewsMedia[]>([]);
  const [loadingMedia, setLoadingMedia]     = useState(false);
  const [mediaTab, setMediaTab]             = useState<MediaType>('photo');
  const [videoUrl, setVideoUrl]             = useState('');
  const [linkUrl, setLinkUrl]               = useState('');
  const [linkCaption, setLinkCaption]       = useState('');
  const [addingMedia, setAddingMedia]       = useState(false);
  const [photoQueue, setPhotoQueue]         = useState<QueueItem[]>([]);
  const [bulkUploading, setBulkUploading]   = useState(false);
  const [bulkDone, setBulkDone]             = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [arts, cats] = await Promise.all([newsApi.list({ admin: true }), newsApi.categories()]);
      setArticles(arts);
      setCategories(cats);
    } catch { toast.error('Failed to load data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Form helpers ── */
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); closeMedia(); };
  const openEdit = (a: News) => {
    setEditing(a);
    setForm({
      title: a.title, slug: a.slug, excerpt: a.excerpt ?? '', content: a.content ?? '',
      featured_image_url: a.featured_image_url ?? '', category_id: a.category_id ?? '',
      status: a.status as NewsStatus,
      title_en: (a as any).title_en ?? '',
      excerpt_en: (a as any).excerpt_en ?? '',
      content_en: (a as any).content_en ?? '',
    });
    setShowForm(true); closeMedia();
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };
  const set = (key: keyof NewsForm, val: string) => {
    setForm(prev => { const next = { ...prev, [key]: val }; if (key === 'title' && !editing) next.slug = slugify(val); return next; });
  };

  /* ── Featured image upload ── */
  const handleImageUpload = async (file: File) => {
    if (!token) { toast.error('Not authenticated.'); return; }
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, token, 'news');
      set('featured_image_url', result.url);
      toast.success('Image uploaded.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploading(false); }
  };

  /* ── Save article ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) { toast.error('Title and slug are required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null, content: form.content.trim() || null,
      featured_image_url: form.featured_image_url.trim() || null,
      category_id: form.category_id || null, status: form.status,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
      title_en: form.title_en.trim() || null,
      excerpt_en: form.excerpt_en.trim() || null,
      content_en: form.content_en.trim() || null,
    };
    try {
      if (editing) { await newsApi.update(editing.id, payload); toast.success('Article updated.'); }
      else { await newsApi.create(payload); toast.success('Article created.'); }
      closeForm(); fetchAll();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    setDeleting(id);
    try { await newsApi.remove(id); toast.success('Article deleted.'); fetchAll(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setDeleting(null); }
  };

  /* ── Media panel ── */
  const openMedia = async (articleId: string) => {
    if (mediaArticleId === articleId) { closeMedia(); return; }
    setMediaArticleId(articleId);
    setLoadingMedia(true);
    setPhotoQueue([]); setBulkDone(false); setVideoUrl(''); setLinkUrl(''); setLinkCaption('');
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/news/${articleId}/media`, { headers: { Authorization: `Bearer ${token}` } });
      setArticleMedia(res.ok ? await res.json() : []);
    } finally { setLoadingMedia(false); }
  };
  const closeMedia = () => { setMediaArticleId(null); setArticleMedia([]); setPhotoQueue([]); setBulkDone(false); };

  const deleteMedia = async (mediaId: string, articleId: string) => {
    const token = getAuthToken();
    await fetch(`/api/news/${articleId}/media?mediaId=${mediaId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setArticleMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  /* ── Add video / link ── */
  const addMediaItem = async (type: 'video' | 'link') => {
    const url = type === 'video' ? videoUrl.trim() : linkUrl.trim();
    if (!url || !mediaArticleId) { toast.error('URL is required'); return; }
    const tok = getAuthToken();
    setAddingMedia(true);
    try {
      const res = await fetch(`/api/news/${mediaArticleId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ media_type: type, url, caption: type === 'link' ? linkCaption || null : null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return; }
      setArticleMedia(prev => [...prev, data]);
      if (type === 'video') setVideoUrl('');
      else { setLinkUrl(''); setLinkCaption(''); }
      toast.success(`${type === 'video' ? 'Video' : 'Link'} added.`);
    } finally { setAddingMedia(false); }
  };

  /* ── Bulk photo select ── */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
    const items: QueueItem[] = files.map(f => ({
      id: Math.random().toString(36).slice(2), file: f,
      preview: URL.createObjectURL(f), status: 'pending', cloudUrl: '', error: '',
    }));
    setPhotoQueue(items); setBulkDone(false);
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  const handleBulkUpload = async () => {
    if (!token || !mediaArticleId || photoQueue.length === 0) return;
    setBulkUploading(true); setBulkDone(false);

    const uploadOne = async (item: QueueItem): Promise<QueueItem> => {
      setPhotoQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'uploading' } : x));
      try {
        const result = await uploadToCloudinary(item.file, token, 'news');
        setPhotoQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'done', cloudUrl: result.url } : x));
        return { ...item, status: 'done', cloudUrl: result.url };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed';
        setPhotoQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'error', error: msg } : x));
        return { ...item, status: 'error', error: msg };
      }
    };

    const chunks: QueueItem[][] = [];
    for (let i = 0; i < photoQueue.length; i += 3) chunks.push(photoQueue.slice(i, i + 3));
    const allResults: QueueItem[] = [];
    for (const chunk of chunks) allResults.push(...await Promise.all(chunk.map(uploadOne)));

    const tok = getAuthToken();
    for (const item of allResults.filter(r => r.status === 'done' && r.cloudUrl)) {
      try {
        const res = await fetch(`/api/news/${mediaArticleId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
          body: JSON.stringify({ media_type: 'photo', url: item.cloudUrl }),
        });
        if (res.ok) {
          const saved = await res.json();
          setArticleMedia(prev => [...prev, saved]);
        }
      } catch {}
    }

    setBulkUploading(false); setBulkDone(true);
    toast.success(`${allResults.filter(r => r.status === 'done').length} photos uploaded.`);
  };

  /* ── Render video embed ── */
  const renderMediaPreview = (m: NewsMedia) => {
    if (m.media_type === 'photo') {
      return <img src={m.url} alt="" className="h-16 w-24 rounded object-cover" loading="lazy" />;
    }
    if (m.media_type === 'video') {
      const embed = getVideoEmbed(m.url);
      if (embed.type === 'youtube') return (
        <div className="w-48 aspect-video rounded overflow-hidden">
          <iframe src={embed.embedUrl} className="h-full w-full" allowFullScreen />
        </div>
      );
      if (embed.type === 'facebook') return (
        <div className="w-48">
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(m.url)}&width=200&show_text=false`}
            width="200" height="113" scrolling="no" className="rounded overflow-hidden"
            allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      );
      return <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px] block">{m.url}</a>;
    }
    return <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px] block">{m.caption || m.url}</a>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">News</h1><p className="text-sm text-muted-foreground mt-1">Manage news articles and announcements.</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      {/* ── Article form ── */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">{editing ? 'Edit Article' : 'New Article'}</h2>
            <button onClick={closeForm} className="rounded-lg p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Article title" required />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5">Title <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-semibold">EN</span></Label>
                <Input value={form.title_en} onChange={e => set('title_en', e.target.value)} placeholder="English title (optional)" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="article-slug" required />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category_id || 'none'} onValueChange={v => set('category_id', v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Featured Image</Label>
                <div className="flex gap-2">
                  <Input value={form.featured_image_url} onChange={e => set('featured_image_url', e.target.value)} placeholder="https:// or upload" className="flex-1" />
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
                {form.featured_image_url && (
                  <img src={form.featured_image_url} alt="Preview" className="h-24 rounded-lg border border-border object-cover mt-1" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Short summary..." rows={2} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5">Excerpt <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-semibold">EN</span></Label>
                <Textarea value={form.excerpt_en} onChange={e => set('excerpt_en', e.target.value)} placeholder="English excerpt (optional)" rows={2} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={e => set('content', e.target.value)} placeholder="Full article content..." rows={8} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5">Content <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-semibold">EN</span></Label>
                <Textarea value={form.content_en} onChange={e => set('content_en', e.target.value)} placeholder="English content (optional)" rows={8} />
              </div>
              <div className="md:col-span-2">
                <Button type="button" variant="outline" size="sm" disabled={translating}
                  onClick={async () => {
                    const [t1, t2, t3] = await autoTranslate([form.title, form.excerpt, form.content]);
                    if (t1 && !form.title_en.trim()) set('title_en', t1);
                    if (t2 && !form.excerpt_en.trim()) set('excerpt_en', t2);
                    if (t3 && !form.content_en.trim()) set('content_en', t3);
                  }}>
                  {translating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Translating…</> : <><Languages className="h-4 w-4 mr-2" />Auto-translate Hindi → English</>}
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Save Changes' : 'Publish'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Articles table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Newspaper className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No articles yet. Create your first one.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Created</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map(a => {
                  const displayTitle = (lang === 'en' && (a as any).title_en) ? (a as any).title_en : a.title;
                  return (
                    <>
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {a.featured_image_url
                            ? <img src={a.featured_image_url} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                            : <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>}
                          <div>
                            <p className="text-sm font-medium truncate max-w-xs">{displayTitle}</p>
                            <p className="text-xs text-muted-foreground">/news/{a.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{a.news_categories?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatDateTime(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[a.status as NewsStatus]}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openMedia(a.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${mediaArticleId === a.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                            title="Manage media">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => openEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                            {deleting === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Media panel ── */}
                    {mediaArticleId === a.id && (
                      <tr key={`${a.id}-media`}>
                        <td colSpan={5} className="px-4 py-4 bg-muted/10 border-b border-border">
                          {loadingMedia ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading media…</div>
                          ) : (
                            <div className="space-y-4">
                              {/* Media type tabs */}
                              <div className="flex gap-2">
                                {(['photo', 'video', 'link'] as MediaType[]).map(t => (
                                  <button key={t} onClick={() => setMediaTab(t)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border capitalize transition-colors
                                      ${mediaTab === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                                    {t === 'photo' && <ImageIcon className="h-3.5 w-3.5" />}
                                    {t === 'video' && <Video className="h-3.5 w-3.5" />}
                                    {t === 'link'  && <LinkIcon className="h-3.5 w-3.5" />}
                                    {t}
                                  </button>
                                ))}
                              </div>

                              {/* Photo upload */}
                              {mediaTab === 'photo' && (
                                <div className="space-y-3">
                                  {photoQueue.length === 0 ? (
                                    <button onClick={() => bulkInputRef.current?.click()}
                                      className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 py-6 transition-all group">
                                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Click to select photos (max {MAX_PHOTOS})</span>
                                    </button>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                                        {photoQueue.map(item => (
                                          <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                            <img src={item.preview} alt="" className="h-full w-full object-cover" />
                                            {item.status === 'uploading' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-4 w-4 text-white animate-spin" /></div>}
                                            {item.status === 'done' && <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-green-400" /></div>}
                                            {item.status === 'error' && <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center"><AlertCircle className="h-4 w-4 text-destructive" /></div>}
                                          </div>
                                        ))}
                                        {photoQueue.length < MAX_PHOTOS && !bulkUploading && !bulkDone && (
                                          <button onClick={() => bulkInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 flex items-center justify-center hover:bg-primary/5 transition-all">
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        {!bulkDone ? (
                                          <button onClick={handleBulkUpload} disabled={bulkUploading}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                            {bulkUploading ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading…</> : <><Upload className="h-4 w-4" />Upload {photoQueue.length} Photo{photoQueue.length !== 1 ? 's' : ''}</>}
                                          </button>
                                        ) : (
                                          <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
                                            <CheckCircle2 className="h-4 w-4" />{photoQueue.filter(x => x.status === 'done').length} photos uploaded!
                                          </div>
                                        )}
                                        <button onClick={() => { photoQueue.forEach(i => URL.revokeObjectURL(i.preview)); setPhotoQueue([]); setBulkDone(false); }}
                                          disabled={bulkUploading}
                                          className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors">
                                          Clear
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <input ref={bulkInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                                </div>
                              )}

                              {/* Video URL */}
                              {mediaTab === 'video' && (
                                <div className="flex gap-2">
                                  <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                                    placeholder="YouTube, Facebook, or any video URL" className="flex-1" />
                                  <Button type="button" size="sm" onClick={() => addMediaItem('video')} disabled={addingMedia || !videoUrl.trim()}>
                                    {addingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Add
                                  </Button>
                                </div>
                              )}

                              {/* Link */}
                              {mediaTab === 'link' && (
                                <div className="space-y-2">
                                  <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
                                  <div className="flex gap-2">
                                    <Input value={linkCaption} onChange={e => setLinkCaption(e.target.value)} placeholder="Caption (optional)" className="flex-1" />
                                    <Button type="button" size="sm" onClick={() => addMediaItem('link')} disabled={addingMedia || !linkUrl.trim()}>
                                      {addingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Existing media */}
                              {articleMedia.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Attached media ({articleMedia.length})</p>
                                  <div className="space-y-2">
                                    {articleMedia.map(m => (
                                      <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5">
                                        <div className="shrink-0">{renderMediaPreview(m)}</div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium capitalize text-muted-foreground">{m.media_type}</p>
                                          <p className="text-xs truncate">{m.caption || m.url}</p>
                                        </div>
                                        <button onClick={() => deleteMedia(m.id, a.id)}
                                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                  );
                })}              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
