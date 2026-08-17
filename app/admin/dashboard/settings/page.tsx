'use client';

import { useEffect, useState } from 'react';
import { settings as settingsApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Settings {
  site_name: string; site_tagline: string; contact_email: string; contact_phone: string;
  contact_address: string; facebook: string; twitter: string; instagram: string;
  youtube: string; hero_title: string; hero_tagline: string; about_text: string;
}

const DEFAULTS: Settings = {
  site_name: 'Pramod Rajput', site_tagline: 'Serving People, Building Tomorrow',
  contact_email: 'pramodrajput0214@gmail.com', contact_phone: '+91 98067 31443',
  contact_address: 'श्री हरिहर नगर फन्दा कला, तह. हुजुर, जिला भोपाल (म.प्र.) 462030',
  facebook: '', twitter: '', instagram: '', youtube: '',
  hero_title: 'Pramod Rajput', hero_tagline: 'Dedicated to public service and community empowerment', about_text: '',
};

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((data) => {
      if (!data) { setLoading(false); return; }
      const map: Partial<Settings> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === 'social_links' && typeof value === 'object' && value !== null) {
          const soc = value as Record<string, string>;
          map.facebook = soc.facebook ?? '';
          map.twitter = soc.twitter ?? '';
          map.instagram = soc.instagram ?? '';
          map.youtube = soc.youtube ?? '';
        } else {
          (map as Record<string, string>)[key] = String(value ?? '');
        }
      }
      setS((prev) => ({ ...prev, ...map }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.save({
        site_name: s.site_name, site_tagline: s.site_tagline,
        contact_email: s.contact_email, contact_phone: s.contact_phone,
        contact_address: s.contact_address, hero_title: s.hero_title,
        hero_tagline: s.hero_tagline, about_text: s.about_text,
        social_links: { facebook: s.facebook, twitter: s.twitter, instagram: s.instagram, youtube: s.youtube },
      });
      toast.success('Settings saved successfully.');
    } catch { toast.error('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const set = (k: keyof Settings, v: string) => setS((p) => ({ ...p, [k]: v }));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground mt-1">Configure site-wide settings.</p></div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Site Identity</h2>
          <div className="space-y-1.5"><Label>Site Name</Label><Input value={s.site_name} onChange={(e) => set('site_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Tagline</Label><Input value={s.site_tagline} onChange={(e) => set('site_tagline', e.target.value)} /></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Hero Section</h2>
          <div className="space-y-1.5"><Label>Hero Title</Label><Input value={s.hero_title} onChange={(e) => set('hero_title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Hero Tagline</Label><Input value={s.hero_tagline} onChange={(e) => set('hero_tagline', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>About Text</Label><Textarea value={s.about_text} onChange={(e) => set('about_text', e.target.value)} rows={3} /></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Contact Information</h2>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={s.contact_email} onChange={(e) => set('contact_email', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={s.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Address</Label><Textarea value={s.contact_address} onChange={(e) => set('contact_address', e.target.value)} rows={2} /></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Social Media Links</h2>
          {(['facebook', 'twitter', 'instagram', 'youtube'] as const).map((soc) => (
            <div key={soc} className="space-y-1.5">
              <Label className="capitalize">{soc}</Label>
              <Input value={s[soc]} onChange={(e) => set(soc, e.target.value)} placeholder={`https://${soc}.com/...`} />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Settings
        </Button>
      </form>
    </div>
  );
}
