'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { events as eventsApi } from '@/lib/api-client';
import type { Event } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays, MapPin, Settings2, ClipboardList, Award, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EventsAdminPage() {
  const [eventList, setEventList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventsApi.list({ admin: true });
      setEventList(data);
    } catch { toast.error('Failed to load events.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await eventsApi.remove(id);
      toast.success('Event deleted successfully.');
      fetchEvents();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to delete event.'); }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground', published: 'bg-primary/10 text-primary',
    registration_open: 'bg-secondary/10 text-secondary', registration_closed: 'bg-accent/10 text-accent',
    completed: 'bg-foreground/10 text-foreground', cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all events on the platform.</p>
        </div>
        <Link href="/admin/dashboard/events/new"><Button><Plus className="h-4 w-4 mr-2" />Create Event</Button></Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : eventList.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Event</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Location</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {eventList.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {event.banner_url ? (
                            <img src={event.banner_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center"><CalendarDays className="h-4 w-4 text-muted-foreground" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.max_participants ? `${event.max_participants} max` : 'No limit'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{event.start_date ? formatDate(event.start_date) : '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{event.venue || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[event.status] || statusColors.draft}`}>
                        {event.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/dashboard/events/${event.id}/form-builder`}>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" title="Form Builder"><Settings2 className="h-3.5 w-3.5" /></button>
                        </Link>
                        <Link href={`/admin/dashboard/registrations?event=${event.id}`}>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" title="Registrations"><ClipboardList className="h-3.5 w-3.5" /></button>
                        </Link>
                        <Link href={`/admin/dashboard/certificates?event=${event.id}`}>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" title="Certificates"><Award className="h-3.5 w-3.5" /></button>
                        </Link>
                        <Link href={`/admin/dashboard/events/${event.id}`}>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        </Link>
                        <button onClick={() => handleDelete(event.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No events yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first event to get started.</p>
          <Link href="/admin/dashboard/events/new"><Button><Plus className="h-4 w-4 mr-2" />Create Event</Button></Link>
        </div>
      )}
    </div>
  );
}
