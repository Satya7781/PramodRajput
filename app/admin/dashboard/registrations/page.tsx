'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Event, Registration } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, XCircle, Clock, Eye, Loader2, ChevronDown, ChevronUp, Download,
} from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';
import { toast } from 'sonner';

interface RegistrationWithDetails extends Registration {
  events?: { title: string };
  values?: { label: string; value: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-muted text-muted-foreground',
};

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event') ?? 'all';

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(eventParam);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('events')
      .select('id, title')
      .order('created_at', { ascending: false })
      .then(({ data }) => setEvents((data ?? []) as Event[]));
  }, []);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('registrations')
      .select('*, events(title)')
      .order('submitted_at', { ascending: false });

    if (selectedEvent !== 'all') query = query.eq('event_id', selectedEvent);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    const { data, error } = await query;
    if (error) { toast.error('Failed to load registrations.'); setLoading(false); return; }

    setRegistrations((data ?? []) as RegistrationWithDetails[]);
    setLoading(false);
  }, [selectedEvent, statusFilter]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const loadDetails = async (reg: RegistrationWithDetails) => {
    if (expandedId === reg.id) { setExpandedId(null); return; }
    setExpandedId(reg.id);

    if (reg.values) return; // already loaded

    const { data: vals } = await supabase
      .from('registration_values')
      .select('value_text, form_fields(label)')
      .eq('registration_id', reg.id);

    const values = (vals ?? []).map((v: { value_text: string | null; form_fields: { label: string } | null }) => ({
      label: v.form_fields?.label ?? '—',
      value: v.value_text ?? '—',
    }));

    setRegistrations((prev) =>
      prev.map((r) => (r.id === reg.id ? { ...r, values } : r))
    );
  };

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    const { error } = await supabase
      .from('registrations')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { toast.error('Failed to update status.'); }
    else {
      toast.success(`Registration ${status}.`);
      fetchRegistrations();
    }
    setActionLoading(null);
  };

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    return r.registration_number.toLowerCase().includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const rows = [['Registration #', 'Event', 'Status', 'Submitted At']];
    filtered.forEach((r) => {
      rows.push([
        r.registration_number,
        (r as RegistrationWithDetails & { events?: { title: string } }).events?.title ?? '',
        r.status,
        formatDateTime(r.submitted_at),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'registrations.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Registrations</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage event registrations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by registration #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 text-sm">
        {['pending', 'approved', 'rejected'].map((s) => {
          const count = registrations.filter((r) => r.status === s).length;
          return (
            <span key={s} className={`rounded-full px-3 py-1 font-medium capitalize ${STATUS_COLORS[s]}`}>
              {count} {s}
            </span>
          );
        })}
        <span className="rounded-full px-3 py-1 font-medium bg-muted text-muted-foreground">
          {registrations.length} total
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No registrations found.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Reg #</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Event</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Submitted</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((reg) => (
                  <>
                    <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium">{reg.registration_number}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {(reg as RegistrationWithDetails & { events?: { title: string } }).events?.title ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {formatDateTime(reg.submitted_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[reg.status] ?? ''}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => loadDetails(reg)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                            title="View Details"
                          >
                            {expandedId === reg.id
                              ? <ChevronUp className="h-3.5 w-3.5" />
                              : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(reg.id, 'approved')}
                                disabled={actionLoading === reg.id + 'approved'}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
                                title="Approve"
                              >
                                {actionLoading === reg.id + 'approved'
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <CheckCircle2 className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => updateStatus(reg.id, 'rejected')}
                                disabled={actionLoading === reg.id + 'rejected'}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                                title="Reject"
                              >
                                {actionLoading === reg.id + 'rejected'
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <XCircle className="h-3.5 w-3.5" />}
                              </button>
                            </>
                          )}
                          {reg.status === 'approved' && (
                            <Link
                              href={`/admin/dashboard/certificates?event=${(reg as RegistrationWithDetails).event_id}&reg=${reg.id}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                              title="Issue Certificate"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === reg.id && (
                      <tr key={`${reg.id}-detail`} className="bg-muted/20">
                        <td colSpan={5} className="px-6 py-4">
                          {reg.values ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {reg.values.map((v, i) => (
                                <div key={i} className="rounded-lg bg-card border border-border p-3">
                                  <p className="text-xs text-muted-foreground mb-0.5">{v.label}</p>
                                  <p className="text-sm font-medium break-all">{v.value}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <Loader2 className="h-4 w-4 animate-spin" /> Loading details...
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
