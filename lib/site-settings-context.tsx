'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_phone_secondary?: string;
  contact_address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  hero_title?: string;
  hero_tagline?: string;
  about_text?: string;
}

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch site settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      console.error('Error fetching site settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
}
