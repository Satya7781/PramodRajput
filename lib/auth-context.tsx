'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, setAuthToken, getAuthToken } from './api-client';
import type { Profile, UserRole } from './types';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage token
  useEffect(() => {
    let mounted = true;
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    auth.me().then((profile) => {
      if (mounted) {
        setUser(profile);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const refreshProfile = async () => {
    const profile = await auth.me();
    setUser(profile);
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { user: profile } = await auth.login(email, password);
      // Fetch full profile
      const full = await auth.me();
      setUser(full ?? (profile as Profile));
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Login failed' };
    }
  };

  const signOut = async () => {
    await auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
