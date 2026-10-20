'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text?: string | null;
  label?: string;
  successMessage?: string;
  className?: string;
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

export function ShareButton({
  title,
  text,
  label = 'Share',
  successMessage = 'Link copied',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || undefined, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      if (!await copyToClipboard(url)) throw new Error('Clipboard unavailable');
      setCopied(true);
      toast.success(successMessage);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Unable to share this link');
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
      <span>{copied ? successMessage : label}</span>
    </button>
  );
}
