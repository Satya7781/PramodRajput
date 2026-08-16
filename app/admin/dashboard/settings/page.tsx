'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Settings {
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  hero_title: string;
  hero_tagline: string;
  about_text: string;
}

const DEFAULTS: Settings = {
  site_name: 'Pramod Rajput',
  site_tagline: 'Serving People, Building Tomorrow',
  contact_email: 'pramodrajput0214@gmail.com',
  contact_phone: '+91 98067 31443',
  contact_address: 'श्री हरिहर नगर फन्दा कला, तह. हुजुर, जिला भोपाल (म.प्र.) 462030',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
  hero_title: 'Pramod Rajput',
  hero_tagline: 'Dedicated to public service and community empowerment',
  about_text: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (!data) { setLoading(false); return; }
      const map: Record<string, string> = {};
      data.forEach((row: { key: string; value: unknown }) => {
        let val = row.value;
        // Values stored as JSONB strings — unwrap
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch { /* keep as-is */ }
        }
        if (row.key === 'social_links' && typeof val === 'object' && val !== null) {
          const s = val as Record<string, string>;
          map['facebook'] = s.facebook ?? '';
          map['twitter'] = s.twitter ?? '';
          map['instagram'] = s.instagram ?? '';
          map['youtube'] = s.youtube ?? '';
        } else {
          map[row.key] = String(val ?? '');
        }
      });
      setSettings((prev) => ({ ...prev, ...map }));
      setLoading(false);
    });
  }, []);

  const upsert = async (key: string, value: unknown) => {
    return supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        upsert('site_name', settings.site_name),
        upsert('site_tagline', settings.site_tagline),
        upsert('contact_email', settings.contact_email),
        upsert('contact_phone', settings.contact_phone),
        upsert('contact_address', settings.contact_address),
        upsert('hero_title', settings.hero_title),
        upsert('hero_tagline', settings.hero_tagline),
        upsert('about_text', settings.about_text),
        upsert('social_links', {
          facebook: settings.facebook,
          twitter: settings.twitter,
          instagram: settings.instagram,
          youtube: settings.youtube,
        }),
      ]);
      toast.success('Settings saved successfully.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof Settings, v: string) => setSettings((p) => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure site-wide settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Identity */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Site Identity</h2>
          <div className="space-y-1.5">
            <Label>Site Name</Label>
            <Input value={settings.site_name} onChange={(e) => set('site_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={settings.site_tagline} onChange={(e) => set('site_tagline', e.target.value)} />
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Hero Section</h2>
          <div className="space-y-1.5">
            <Label>Hero Title</Label>
            <Input value={settings.hero_title} onChange={(e) => set('hero_title', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hero Tagline</Label>
            <Input value={settings.hero_tagline} onChange={(e) => set('hero_tagline', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>About Text</Label>
            <Textarea value={settings.about_text} onChange={(e) => set('about_text', e.target.value)} rows={3} />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Contact Information</h2>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={settings.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={settings.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea value={settings.contact_address} onChange={(e) => set('contact_address', e.target.value)} rows={2} />
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Social Media Links</h2>
          {(['facebook', 'twitter', 'instagram', 'youtube'] as const).map((s) => (
            <div key={s} className="space-y-1.5">
              <Label className="capitalize">{s}</Label>
              <Input value={settings[s]} onChange={(e) => set(s, e.target.value)} placeholder={`https://${s}.com/...`} />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
