const LOCALE_MAP: Record<string, string> = { hi: 'hi-IN', en: 'en-IN' };

function getLocale(lang: string): string {
  return LOCALE_MAP[lang] ?? 'hi-IN';
}

export function formatDate(dateStr: string | null | undefined, lang: string = 'hi'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(getLocale(lang), { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateShort(dateStr: string | null | undefined, lang: string = 'hi'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(getLocale(lang), { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr: string | null | undefined, lang: string = 'hi'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(getLocale(lang), {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

export function slugify(text: string): string {
  // If text contains non-ASCII (Hindi/Devanagari), generate a timestamp-based slug
  if (/[^\x00-\x7F]/.test(text)) {
    const timestamp = Date.now().toString(36);
    const asciiPart = text.replace(/[^\x00-\x7F]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-').toLowerCase().slice(0, 30).trim();
    return asciiPart && asciiPart.length > 2 ? `${asciiPart}-${timestamp}` : `event-${timestamp}`;
  }
  return text
    .toLowerCase()
    .trim()
    // Replace apostrophes/quotes/special punctuation before other processing
    .replace(/['''"""`]/g, '')
    // Replace any non-alphanumeric character (except hyphens) with a hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}
