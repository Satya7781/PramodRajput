'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Event } from '@/lib/types';
import { EventForm } from '@/components/admin/event-form';
import { ArrowLeft, Loader2, Settings2, ClipboardList, Award } from 'lucide-react';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setEvent(data as Event | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Event not found.</p>
        <Link href="/admin/dashboard/events" className="text-primary text-sm mt-2 inline-block">
          ← Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">{event.title}</p>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/dashboard/events/${id}/form-builder`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Form Builder
        </Link>
        <Link
          href={`/admin/dashboard/registrations?event=${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Registrations
        </Link>
        <Link
          href={`/admin/dashboard/certificates?event=${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Award className="h-3.5 w-3.5" />
          Certificates
        </Link>
        <Link
          href={`/events/${event.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          View Public Page ↗
        </Link>
      </div>

      <EventForm event={event} />
    </div>
  );
}
