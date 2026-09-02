/**
 * MyMemory Translation — 100% free, no API key required.
 * Limit: 5,000 words/day on the free (anonymous) tier.
 * Endpoint: https://api.mymemory.translated.net/get
 *
 * Usage:
 *   const en = await translateHiToEn("नमस्ते दुनिया");
 *   const batch = await translateBatch(["हिंदी", "पंक्ति दो"], "hi", "en");
 */

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

// MyMemory caps each request at 500 characters. We chunk longer strings.
const CHUNK_SIZE = 480;

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  // Split on sentence boundaries first to keep meaning intact
  const sentences = text.split(/(?<=[।.!?])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= CHUNK_SIZE) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);
      // If a single sentence is too long, hard-split it
      if (sentence.length > CHUNK_SIZE) {
        let i = 0;
        while (i < sentence.length) {
          chunks.push(sentence.slice(i, i + CHUNK_SIZE));
          i += CHUNK_SIZE;
        }
        current = '';
      } else {
        current = sentence;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(c => c.trim().length > 0);
}

async function translateChunk(
  text: string,
  from: string,
  to: string,
  retries = 2
): Promise<string> {
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PramodRajput-Platform/1.0' },
        signal: AbortSignal.timeout(10_000), // 10 s timeout
      });

      if (!res.ok) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        return text; // fallback: return original
      }

      const json = await res.json() as {
        responseStatus: number;
        responseData: { translatedText: string };
        quotaFinished?: boolean;
      };

      if (json.quotaFinished) {
        console.warn('[translate] MyMemory daily quota finished.');
        return text;
      }

      if (json.responseStatus === 200 && json.responseData?.translatedText) {
        return json.responseData.translatedText;
      }

      return text;
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  return text; // final fallback
}

/**
 * Translate a single string from `from` language to `to` language.
 * Handles long text by chunking and reassembling.
 */
export async function translate(
  text: string | null | undefined,
  from = 'hi',
  to = 'en'
): Promise<string> {
  if (!text || !text.trim()) return '';

  const chunks = chunkText(text.trim());

  // Translate chunks with a small delay between requests to respect rate limits
  const translated: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 150));
    const result = await translateChunk(chunks[i], from, to);
    translated.push(result);
  }

  return translated.join(' ');
}

/** Translate Hindi → English */
export const translateHiToEn = (text: string | null | undefined) =>
  translate(text, 'hi', 'en');

/**
 * Translate multiple strings in one call (sequentially with small gaps).
 * Returns array of translated strings in the same order.
 */
export async function translateBatch(
  texts: (string | null | undefined)[],
  from = 'hi',
  to = 'en'
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < texts.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 200));
    results.push(await translate(texts[i], from, to));
  }
  return results;
}

/**
 * Detect if text contains significant Devanagari (Hindi) script.
 * Used to skip translation if content is already in English.
 */
export function isHindi(text: string | null | undefined): boolean {
  if (!text) return false;
  const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
  return devanagari / text.length > 0.1; // >10% Devanagari chars
}
