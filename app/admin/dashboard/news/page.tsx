'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { News, NewsCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, X, Newspaper } from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';
import { slugify } from '@/lib/date-utils';
import { toast } from 'sonner';

type NewsStatus = 'draft' | 'published' | 'archived';

interface NewsForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  category_id: string;
  status: NewsStatus;
}

const EMPTY_FORM: NewsForm = {
  title: '', slug: '', excerpt: '', content: '',
  featured_image_url: '', category_id: '', status: 'draft',
};

const STATUS_COLORS: Record<NewsStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

export default function NewsAdminPage() {
  const [articles, setArticles] = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState<NewsForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [artRes, catRes] = await Promise.all([
      supabase.from('news').select('*, news_categories(*)').order('created_at', { ascending: false }),
      supabase.from('news_categories').select('*').order('name'),
    ]);
    setArticles((artRes.data ?? []) as News[]);
    setCategories((catRes.data ?? []) as NewsCategory[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (a: News) => {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? '',
      content: a.content ?? '',
      featured_image_url: a.featured_image_url ?? '',
      category_id: a.category_id ?? '',
      status: a.status as NewsStatus,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  const set = (key: keyof NewsForm, val: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'title' && !editing) next.slug = slugify(val);
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) { toast.error('Title and slug are required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      featured_image_url: form.featured_image_url.trim() || null,
      category_id: form.category_id || null,
      status: form.status,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    };
    try {
      if (editing) {
        const { error } = await supabase.from('news').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Article updated.');
      } else {
        const { error } = await supabase.from('news').insert(payload);
        if (error) throw error;
        toast.success('Article created.');
      }
      closeForm();
      fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeleting(id);
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Article deleted.'); fetchAll(); }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage news articles and announcements.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      {/* Slide-in form */}
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
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Article title" required />
              </div>
              <div className="space-y-1.5">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="article-slug" required />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
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
                <Select value={form.category_id} onValueChange={(v) => set('category_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Featured Image URL</Label>
                <Input value={form.featured_image_url} onChange={(e) => set('featured_image_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="Short summary..." rows={2} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="Full article content..." rows={8} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Save Changes' : 'Publish'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
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
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium truncate max-w-xs">{a.title}</p>
                      <p className="text-xs text-muted-foreground">/news/{a.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {a.news_categories?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {formatDateTime(a.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[a.status as NewsStatus]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                          {deleting === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
