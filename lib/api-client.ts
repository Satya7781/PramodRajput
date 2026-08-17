/**
 * API client — replaces Supabase JS client.
 * All requests go to Next.js API routes which talk to the VPS PostgreSQL database.
 */

// Import all types at the top so they are in scope for all functions
import type {
  Profile, Event, EventForm, FormField, FormFieldOption,
  Registration, RegistrationValue, News, NewsCategory,
  PhotoAlbum, Photo, Video, Certificate, SiteSetting, AuditLog,
} from './types';

export type {
  Profile, Event, EventForm, FormField, FormFieldOption,
  Registration, RegistrationValue, News, NewsCategory,
  PhotoAlbum, Photo, Video, Certificate, SiteSetting, AuditLog,
};

const BASE = '';   // same-origin; all routes are under /api

// ─── token storage (browser only) ────────────────────────────────────────────
let _token: string | null = null;

export function setAuthToken(token: string | null) {
  _token = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  if (_token) return _token;
  if (typeof window !== 'undefined') {
    _token = localStorage.getItem('auth_token');
  }
  return _token;
}

// ─── fetch wrapper ────────────────────────────────────────────────────────────
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error ?? msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  async login(email: string, password: string) {
    const data = await apiFetch<{ token: string; user: Profile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async logout() {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setAuthToken(null);
  },

  async me(): Promise<Profile | null> {
    try {
      return await apiFetch<Profile>('/api/auth/me');
    } catch {
      return null;
    }
  },
};

// ─── file upload ──────────────────────────────────────────────────────────────
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await apiFetch<{ url: string }>('/api/upload', {
    method: 'POST',
    body: formData,
  });
  return result.url;
}

// ─── events ──────────────────────────────────────────────────────────────────
export const events = {
  list(params: { admin?: boolean; status?: string } = {}) {
    const q = new URLSearchParams();
    if (params.admin) q.set('admin', '1');
    if (params.status) q.set('status', params.status);
    return apiFetch<Event[]>(`/api/events?${q}`);
  },
  getById(id: string) { return apiFetch<Event>(`/api/events/${id}`); },
  getBySlug(slug: string) { return apiFetch<Event>(`/api/events/slug/${encodeURIComponent(slug)}`); },
  create(payload: Partial<Event>) {
    return apiFetch<Event>('/api/events', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<Event>) {
    return apiFetch<Event>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return apiFetch<{ success: boolean }>(`/api/events/${id}`, { method: 'DELETE' });
  },
  getForm(eventId: string) {
    return apiFetch<{ form: EventForm | null; fields: FormField[] } | null>(`/api/events/${eventId}/form`);
  },
  saveForm(eventId: string, payload: { title: string; description: string; fields: unknown[] }) {
    return apiFetch(`/api/events/${eventId}/form`, { method: 'PUT', body: JSON.stringify(payload) });
  },
};

// ─── registrations ────────────────────────────────────────────────────────────
export const registrations = {
  list(params: { event_id?: string; status?: string } = {}) {
    const q = new URLSearchParams();
    if (params.event_id) q.set('event_id', params.event_id);
    if (params.status) q.set('status', params.status);
    return apiFetch<Registration[]>(`/api/registrations?${q}`);
  },
  getValues(id: string) {
    return apiFetch<{ label: string; value: string }[]>(`/api/registrations/${id}`);
  },
  submit(payload: { event_id: string; form_id: string; values: { field_id: string; value_text: string }[] }) {
    return apiFetch<Registration>('/api/registrations', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateStatus(id: string, status: string) {
    return apiFetch<Registration>(`/api/registrations/${id}`, {
      method: 'PUT', body: JSON.stringify({ status }),
    });
  },
};

// ─── news ─────────────────────────────────────────────────────────────────────
export const news = {
  list(params: { admin?: boolean; limit?: number; category_id?: string } = {}) {
    const q = new URLSearchParams();
    if (params.admin) q.set('admin', '1');
    if (params.limit) q.set('limit', String(params.limit));
    if (params.category_id) q.set('category_id', params.category_id);
    return apiFetch<News[]>(`/api/news?${q}`);
  },
  getById(id: string) { return apiFetch<News>(`/api/news/${id}`); },
  getBySlug(slug: string) {
    return apiFetch<News[]>(`/api/news?slug=${encodeURIComponent(slug)}`).then(arr => arr[0] ?? null);
  },
  categories() { return apiFetch<NewsCategory[]>('/api/news/categories'); },
  create(payload: Partial<News>) {
    return apiFetch<News>('/api/news', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<News>) {
    return apiFetch<News>(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return apiFetch<{ success: boolean }>(`/api/news/${id}`, { method: 'DELETE' });
  },
};

// ─── albums ──────────────────────────────────────────────────────────────────
export const albums = {
  list(params: { admin?: boolean; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.admin) q.set('admin', '1');
    if (params.limit) q.set('limit', String(params.limit));
    return apiFetch<PhotoAlbum[]>(`/api/albums?${q}`);
  },
  getBySlug(slug: string) {
    return apiFetch<{ album: PhotoAlbum; photos: Photo[] }>(`/api/albums/slug/${encodeURIComponent(slug)}`);
  },
  create(payload: Partial<PhotoAlbum>) {
    return apiFetch<PhotoAlbum>('/api/albums', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<PhotoAlbum>) {
    return apiFetch<PhotoAlbum>(`/api/albums/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return apiFetch<{ success: boolean }>(`/api/albums/${id}`, { method: 'DELETE' });
  },
  getPhotos(albumId: string) { return apiFetch<Photo[]>(`/api/albums/${albumId}/photos`); },
  addPhoto(albumId: string, payload: { image_url: string; caption?: string }) {
    return apiFetch<Photo>(`/api/albums/${albumId}/photos`, { method: 'POST', body: JSON.stringify(payload) });
  },
  removePhoto(albumId: string, photoId: string) {
    return apiFetch<{ success: boolean }>(`/api/albums/${albumId}/photos/${photoId}`, { method: 'DELETE' });
  },
};

// ─── videos ──────────────────────────────────────────────────────────────────
export const videos = {
  list(params: { admin?: boolean; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.admin) q.set('admin', '1');
    if (params.limit) q.set('limit', String(params.limit));
    return apiFetch<Video[]>(`/api/videos?${q}`);
  },
  create(payload: Partial<Video>) {
    return apiFetch<Video>('/api/videos', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<Video>) {
    return apiFetch<Video>(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return apiFetch<{ success: boolean }>(`/api/videos/${id}`, { method: 'DELETE' });
  },
};

// ─── certificates ─────────────────────────────────────────────────────────────
export const certificates = {
  list(params: { event_id?: string; search?: string } = {}) {
    const q = new URLSearchParams();
    if (params.event_id) q.set('event_id', params.event_id);
    if (params.search) q.set('search', params.search);
    return apiFetch<Certificate[]>(`/api/certificates?${q}`);
  },
  pending(eventId?: string) {
    const q = eventId ? `?event_id=${eventId}` : '';
    return apiFetch<PendingReg[]>(`/api/certificates/pending${q}`);
  },
  issue(payload: { registration_id: string; event_id: string; template_id: string; participant_name: string }) {
    return apiFetch<Certificate>('/api/certificates', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateStatus(id: string, status: 'valid' | 'revoked', revocation_reason?: string) {
    return apiFetch<Certificate>(`/api/certificates/${id}`, {
      method: 'PUT', body: JSON.stringify({ status, revocation_reason }),
    });
  },
  verify(certificateNumber: string) {
    return apiFetch<Certificate>(`/api/certificates/verify/${encodeURIComponent(certificateNumber)}`);
  },
  templates() { return apiFetch<{ id: string; name: string }[]>('/api/certificate-templates'); },
};

// ─── users ────────────────────────────────────────────────────────────────────
export const users = {
  list() { return apiFetch<Profile[]>('/api/users'); },
  update(id: string, payload: { role?: 'admin' | 'editor'; is_active?: boolean }) {
    return apiFetch<Profile>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
};

// ─── settings ─────────────────────────────────────────────────────────────────
export const settings = {
  get() { return apiFetch<Record<string, unknown>>('/api/settings'); },
  save(payload: Record<string, unknown>) {
    return apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(payload) });
  },
};

// ─── stats ────────────────────────────────────────────────────────────────────
export const stats = {
  get() {
    return apiFetch<{
      totalEvents: number; activeEvents: number;
      totalRegistrations: number; pendingRegistrations: number;
      certificatesGenerated: number; newsArticles: number;
      photoAlbums: number; videos: number;
    }>('/api/stats');
  },
};

// ─── audit logs ───────────────────────────────────────────────────────────────
export const auditLogs = {
  list(params: { limit?: number; search?: string } = {}) {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    return apiFetch<AuditLog[]>(`/api/audit-logs?${q}`);
  },
};

// Extra type for pending cert issuance
export interface PendingReg {
  id: string;
  registration_number: string;
  event_id: string;
  participant_name: string | null;
}
