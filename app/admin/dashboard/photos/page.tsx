'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { albums as albumsApi, uploadFile } from '@/lib/api-client';
import type { PhotoAlbum, Photo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, X, ImageIcon, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { slugify } from '@/lib/date-utils';
import { toast } from 'sonner';

interface AlbumWithPhotos extends PhotoAlbum { photos?: Photo[]; }

interface AlbumForm {
  title: string; slug: string; description: string;
  cover_image_url: string; status: 'published' | 'draft' | 'archived';
}

const EMPTY_ALBUM: AlbumForm = { title: '', slug: '', description: '', cover_image_url: '', status: 'published' };

export default function PhotosAdminPage() {
  const [albumList, setAlbumList] = useState<AlbumWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);
  const [albumForm, setAlbumForm] = useState<AlbumForm>(EMPTY_ALBUM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const activeAlbumRef = useRef<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await albumsApi.list({ admin: true });
      setAlbumList(data as AlbumWithPhotos[]);
    } catch { toast.error('Failed to load albums.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  const loadPhotos = async (albumId: string) => {
    if (expandedAlbum === albumId) { setExpandedAlbum(null); return; }
    setExpandedAlbum(albumId);
    const album = albumList.find((a) => a.id === albumId);
    if (album?.photos) return;
    try {
      const photos = await albumsApi.getPhotos(albumId);
      setAlbumList((prev) => prev.map((a) => a.id === albumId ? { ...a, photos } : a));
    } catch { toast.error('Failed to load photos.'); }
  };

  const openCreate = () => { setEditingAlbum(null); setAlbumForm(EMPTY_ALBUM); setShowAlbumForm(true); };
  const openEdit = (a: PhotoAlbum) => {
    setEditingAlbum(a);
    setAlbumForm({ title: a.title, slug: a.slug, description: a.description ?? '', cover_image_url: a.cover_image_url ?? '', status: a.status as AlbumForm['status'] });
    setShowAlbumForm(true);
  };
  const closeForm = () => { setShowAlbumForm(false); setEditingAlbum(null); setAlbumForm(EMPTY_ALBUM); };

  const setField = (k: keyof AlbumForm, v: string) => {
    setAlbumForm((p) => { const next = { ...p, [k]: v }; if (k === 'title' && !editingAlbum) next.slug = slugify(v); return next; });
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      setField('cover_image_url', url);
      toast.success('Cover image uploaded.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploadingCover(false); }
  };

  const saveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.title.trim() || !albumForm.slug.trim()) { toast.error('Title and slug required.'); return; }
    setSaving(true);
    const payload = {
      title: albumForm.title.trim(), slug: albumForm.slug.trim(),
      description: albumForm.description.trim() || null,
      cover_image_url: albumForm.cover_image_url.trim() || null,
      status: albumForm.status,
    };
    try {
      if (editingAlbum) { await albumsApi.update(editingAlbum.id, payload); toast.success('Album updated.'); }
      else { await albumsApi.create(payload); toast.success('Album created.'); }
      closeForm(); fetchAlbums();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm('Delete this album and all its photos?')) return;
    setDeleting(id);
    try { await albumsApi.remove(id); toast.success('Album deleted.'); fetchAlbums(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setDeleting(null); }
  };

  // Upload a photo file directly
  const handlePhotoFileUpload = async (albumId: string, file: File) => {
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file);
      await albumsApi.addPhoto(albumId, { image_url: url, caption: newPhotoCaption.trim() || undefined });
      toast.success('Photo uploaded and added.');
      setNewPhotoCaption('');
      const photos = await albumsApi.getPhotos(albumId);
      setAlbumList((prev) => prev.map((a) => a.id === albumId ? { ...a, photos } : a));
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploadingPhoto(false); }
  };

  const deletePhoto = async (photoId: string, albumId: string) => {
    try {
      await albumsApi.removePhoto(albumId, photoId);
      toast.success('Photo removed.');
      const photos = await albumsApi.getPhotos(albumId);
      setAlbumList((prev) => prev.map((a) => a.id === albumId ? { ...a, photos } : a));
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Photos</h1><p className="text-sm text-muted-foreground mt-1">Manage photo albums and images.</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Album</Button>
      </div>

      {showAlbumForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingAlbum ? 'Edit Album' : 'New Album'}</h2>
            <button onClick={closeForm} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={saveAlbum} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input value={albumForm.title} onChange={(e) => setField('title', e.target.value)} placeholder="Album title" required />
            </div>
            <div className="space-y-1.5">
              <Label>Slug <span className="text-destructive">*</span></Label>
              <Input value={albumForm.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="album-slug" required />
            </div>
            <div className="space-y-1.5">
              <Label>Cover Image</Label>
              <div className="flex gap-2">
                <Input value={albumForm.cover_image_url} onChange={(e) => setField('cover_image_url', e.target.value)} placeholder="https:// or upload" className="flex-1" />
                <input ref={coverFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ''; }} />
                <Button type="button" variant="outline" size="sm" onClick={() => coverFileRef.current?.click()} disabled={uploadingCover}>
                  {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {albumForm.cover_image_url && (
                <img src={albumForm.cover_image_url} alt="Cover" className="h-20 rounded-lg border border-border object-cover mt-1"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={albumForm.status} onValueChange={(v) => setField('status', v)}>
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
              <Textarea value={albumForm.description} onChange={(e) => setField('description', e.target.value)} rows={2} placeholder="Optional album description" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving || uploadingCover}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAlbum ? 'Save Changes' : 'Create Album'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : albumList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />No albums yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {albumList.map((album) => (
            <div key={album.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {album.cover_image_url
                    ? <img src={album.cover_image_url} alt="" className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{album.title}</p>
                  <p className="text-xs text-muted-foreground">{album.status} · /gallery/photos/{album.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => loadPhotos(album.id)} className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted transition-colors" title="Photos">
                    {expandedAlbum === album.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(album)} className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted transition-colors" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteAlbum(album.id)} disabled={deleting === album.id} className="flex h-8 w-8 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                    {deleting === album.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {expandedAlbum === album.id && (
                <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                  {/* Upload photo */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <Input
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Caption (optional)"
                      className="w-48"
                    />
                    <input
                      ref={photoFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        activeAlbumRef.current = album.id;
                        for (const file of files) {
                          await handlePhotoFileUpload(album.id, file);
                        }
                        e.target.value = '';
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => { activeAlbumRef.current = album.id; photoFileRef.current?.click(); }}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                      Upload Photo(s)
                    </Button>
                  </div>

                  {/* Photo grid */}
                  {album.photos && album.photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {album.photos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
                          <img src={photo.image_url} alt={photo.caption ?? ''} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => deletePhoto(photo.id, album.id)} className="rounded-full bg-destructive/90 p-1.5 text-white">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {photo.caption && <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1 truncate">{photo.caption}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No photos in this album yet. Upload some above.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
