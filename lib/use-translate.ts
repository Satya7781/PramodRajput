'use client';

import { useState } from 'react';
import { toast } from 'sonner';

/**
 * useAutoTranslate — calls /api/translate to get English translations
 * of multiple Hindi strings in one network round-trip.
 */
export function useAutoTranslate() {
  const [translating, setTranslating] = useState(false);

  /**
   * Translate an array of strings (Hindi → English).
   * Returns array of translated strings in the same order.
   * Empty/null entries are passed through as ''.
   */
  async function autoTranslate(texts: (string | null | undefined)[]): Promise<string[]> {
    setTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, from: 'hi', to: 'en' }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }

      const data = await res.json() as { translated: string[] };
      toast.success('Auto-translation complete.');
      return data.translated;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Translation failed. Please try again.');
      return texts.map(() => '');
    } finally {
      setTranslating(false);
    }
  }

  return { autoTranslate, translating };
}
