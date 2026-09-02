import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { translate, translateBatch } from '@/lib/translate';

/**
 * POST /api/translate
 * Body: { text: string, from?: string, to?: string }
 *   OR  { texts: string[], from?: string, to?: string }
 *
 * Returns: { translated: string } OR { translated: string[] }
 *
 * No API key needed — uses MyMemory free tier.
 */
export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const { text, texts, from = 'hi', to = 'en' } = body as {
      text?: string;
      texts?: string[];
      from?: string;
      to?: string;
    };

    // Batch mode
    if (Array.isArray(texts)) {
      const translated = await translateBatch(texts, from, to);
      return ok({ translated });
    }

    // Single mode
    if (typeof text === 'string') {
      const translated = await translate(text, from, to);
      return ok({ translated });
    }

    return err('Provide either "text" (string) or "texts" (array)');
  } catch (e) {
    console.error('POST /api/translate error:', e);
    return err('Translation failed', 500);
  }
}
