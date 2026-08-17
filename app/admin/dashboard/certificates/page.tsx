'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { events as eventsApi, certificates as certsApi } from '@/lib/api-client';
import type { Event, Certificate } from '@/lib/types';
import type { PendingReg } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Award, Loader2, ShieldX, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';
import { toast } from 'sonner';

interface CertWithMeta extends Certificate {
  event_title?: string;
  registration_number?: string;
}

export default function CertificatesPage() {
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event') ?? 'all';

  const [eventList, setEventList] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(eventParam);
  const [tab, setTab] = useState<'issued' | 'pending'>('issued');
  const [certs, setCerts] = useState<CertWithMeta[]>([]);
  const [pendingRegs, setPendingRegs] = useState<PendingReg[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      eventsApi.list({ admin: true }),
      certsApi.templates(),
    ]).then(([evs, tmpls]) => {
      setEventList(evs);
      setTemplates(tmpls);
      if (tmpls.length > 0) setSelectedTemplate(tmpls[0].id);
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const eventId = selectedEvent !== 'all' ? selectedEvent : undefined;
      const [certData, pendingData] = await Promise.all([
        certsApi.list({ event_id: eventId, search: search || undefined }),
        certsApi.pending(eventId),
      ]);
      setCerts(certData as CertWithMeta[]);
      setPendingRegs(pendingData);
    } catch { toast.error('Failed to load certificates.'); }
    finally { setLoading(false); }
  }, [selectedEvent, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const issueCertificate = async (reg: PendingReg) => {
    if (!selectedTemplate) { toast.error('Please select a certificate template first.'); return; }
    setIssuing(reg.id);
    try {
      await certsApi.issue({ registration_id: reg.id, event_id: reg.event_id, template_id: selectedTemplate, participant_name: reg.participant_name ?? reg.registration_number });
      toast.success('Certificate issued successfully.');
      fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to issue certificate.'); }
    finally { setIssuing(null); }
  };

  const issueAll = async () => {
    if (!selectedTemplate) { toast.error('Please select a certificate template first.'); return; }
    if (pendingRegs.length === 0) { toast.info('No pending registrations.'); return; }
    setIssuing('bulk');
    let count = 0;
    for (const reg of pendingRegs) {
      try {
        await certsApi.issue({ registration_id: reg.id, event_id: reg.event_id, template_id: selectedTemplate, participant_name: reg.participant_name ?? reg.registration_number });
        count++;
      } catch { /* continue */ }
    }
    toast.success(`Issued ${count} certificates.`);
    fetchData();
    setIssuing(null);
  };

  const revokeCert = async (id: string) => {
    if (!confirm('Revoke this certificate? It will no longer be valid.')) return;
    setRevoking(id);
    try {
      await certsApi.updateStatus(id, 'revoked');
      toast.success('Certificate revoked.');
      fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setRevoking(null); }
  };

  const reinstateC = async (id: string) => {
    setRevoking(id);
    try {
      await certsApi.updateStatus(id, 'valid');
      toast.success('Certificate reinstated.');
      fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed.'); }
    finally { setRevoking(null); }
  };

  const filteredCerts = certs.filter((c) => !search || c.certificate_number.toLowerCase().includes(search.toLowerCase()) || c.participant_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Certificates</h1><p className="text-sm text-muted-foreground mt-1">Issue and manage participant certificates.</p></div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All Events" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {eventList.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
          </SelectContent>
        </Select>
        {templates.length > 0 && (
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Select Template" /></SelectTrigger>
            <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <Input placeholder="Search certificates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(['issued', 'pending'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'issued' ? `Issued (${certs.length})` : `Pending (${pendingRegs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : tab === 'issued' ? (
        filteredCerts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground"><Award className="h-10 w-10 mx-auto mb-3 opacity-40" />No certificates issued yet.</div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Certificate #</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Participant</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Event</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Issued</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono">{cert.certificate_number}</td>
                      <td className="px-4 py-3 text-sm font-medium">{cert.participant_name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{cert.event_title ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatDateTime(cert.issued_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cert.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cert.status === 'valid' ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}{cert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {cert.status === 'valid' ? (
                            <button onClick={() => revokeCert(cert.id)} disabled={revoking === cert.id} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors" title="Revoke">
                              {revoking === cert.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldX className="h-3.5 w-3.5" />}
                            </button>
                          ) : (
                            <button onClick={() => reinstateC(cert.id)} disabled={revoking === cert.id} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors" title="Reinstate">
                              {revoking === cert.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {pendingRegs.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{pendingRegs.length} approved registration(s) without certificates.</p>
              <Button size="sm" onClick={issueAll} disabled={issuing === 'bulk'}>
                {issuing === 'bulk' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Award className="h-4 w-4 mr-2" />}Issue All
              </Button>
            </div>
          )}
          {pendingRegs.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground"><ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />All approved registrations have certificates.</div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Registration #</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Participant</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono">{reg.registration_number}</td>
                      <td className="px-4 py-3 text-sm">{reg.participant_name ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => issueCertificate(reg)} disabled={issuing === reg.id}>
                          {issuing === reg.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Award className="h-3.5 w-3.5 mr-1.5" />}Issue
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
