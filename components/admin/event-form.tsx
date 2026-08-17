'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { events as eventsApi, uploadFile } from '@/lib/api-client';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { slugify } from '@/lib/date-utils';

type EventStatus = Event['status'];

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!event;
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(event?.title ?? '');
  const [slug, setSlug] = useState(event?.slug ?? '');
  const [shortDescription, setShortDescription] = useState(event?.short_description ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [bannerUrl, setBannerUrl] = useState(event?.banner_url ?? '');
  const [startDate, setStartDate] = useState(event?.start_date ?? '');
  const [endDate, setEndDate] = useState(event?.end_date ?? '');
  const [startTime, setStartTime] = useState(event?.start_time ?? '');
  const [endTime, setEndTime] = useState(event?.end_time ?? '');
  const [venue, setVenue] = useState(event?.venue ?? '');
  const [address, setAddress] = useState(event?.address ?? '');
  const [regStart, setRegStart] = useState(event?.registration_start ? event.registration_start.slice(0, 16) : '');
  const [regEnd, setRegEnd] = useState(event?.registration_end ? event.registration_end.slice(0, 16) : '');
  const [maxParticipants, setMaxParticipants] = useState(event?.max_participants?.toString() ?? '');
  const [registrationEnabled, setRegistrationEnabled] = useState(event?.registration_enabled ?? false);
  const [certificateEnabled, setCertificateEnabled] = useState(event?.certificate_enabled ?? false);
  const [status, setStatus] = useState<EventStatus>(event?.status ?? 'draft');
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) setSlug(slugify(val));
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const url = await uploadFile(file);
      setBannerUrl(url);
      toast.success('Banner uploaded successfully.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploadingBanner(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) { toast.error('Title and slug are required.'); return; }
    setSaving(true);

    const payload = {
      title: title.trim(), slug: slug.trim(),
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      banner_url: bannerUrl.trim() || null,
      start_date: startDate || null, end_date: endDate || null,
      start_time: startTime || null, end_time: endTime || null,
      venue: venue.trim() || null, address: address.trim() || null,
      registration_start: regStart ? new Date(regStart).toISOString() : null,
      registration_end: regEnd ? new Date(regEnd).toISOString() : null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      registration_enabled: registrationEnabled,
      certificate_enabled: certificateEnabled,
      status,
    };

    try {
      if (isEdit) {
        await eventsApi.update(event.id, payload);
        toast.success('Event updated successfully.');
      } else {
        const created = await eventsApi.create(payload);
        toast.success('Event created successfully.');
        router.push(`/admin/dashboard/events/${(created as Event).id}`);
        return;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-base">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
            <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Youth Leadership Summit 2026" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="slug">URL Slug <span className="text-destructive">*</span></Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="youth-leadership-summit-2026" required />
            <p className="text-xs text-muted-foreground">Used in the event URL: /events/<strong>{slug || 'slug'}</strong></p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDesc">Short Description</Label>
            <Textarea id="shortDesc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="One-line summary shown on event cards..." rows={2} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed event description..." rows={6} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bannerUrl">Banner Image</Label>
            <div className="flex gap-2">
              <Input id="bannerUrl" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https:// or upload below" className="flex-1" />
              <input ref={bannerFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); e.target.value = ''; }} />
              <Button type="button" variant="outline" onClick={() => bannerFileRef.current?.click()} disabled={uploadingBanner}>
                {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            {bannerUrl && (
              <img src={bannerUrl} alt="Banner preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-border"
                onError={(e) => (e.currentTarget.style.display = 'none')} />
            )}
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-base">Date & Time</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="startTime">Start Time</Label><Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="endTime">End Time</Label><Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
        </div>
      </div>

      {/* Venue */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-base">Venue</h2>
        <div className="space-y-2"><Label htmlFor="venue">Venue Name</Label><Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Community Hall, Bhopal" /></div>
        <div className="space-y-2"><Label htmlFor="address">Full Address</Label><Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State, PIN" rows={2} /></div>
      </div>

      {/* Registration */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-base">Registration Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2"><Label htmlFor="regStart">Registration Opens</Label><Input id="regStart" type="datetime-local" value={regStart} onChange={(e) => setRegStart(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="regEnd">Registration Closes</Label><Input id="regEnd" type="datetime-local" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="maxParticipants">Max Participants</Label><Input id="maxParticipants" type="number" min="1" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Leave blank for unlimited" /></div>
        </div>
        <div className="flex flex-col gap-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" checked={registrationEnabled} onChange={(e) => setRegistrationEnabled(e.target.checked)} />
            <span className="text-sm font-medium">Enable online registration</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" checked={certificateEnabled} onChange={(e) => setCertificateEnabled(e.target.checked)} />
            <span className="text-sm font-medium">Enable certificate issuance</span>
          </label>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Publication Status</h2>
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="registration_open">Registration Open</SelectItem>
              <SelectItem value="registration_closed">Registration Closed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving || uploadingBanner}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isEdit ? 'Save Changes' : 'Create Event'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
