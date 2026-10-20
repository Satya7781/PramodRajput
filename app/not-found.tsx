'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Large 404 */}
      <div className="mb-6 select-none">
        <span className="text-[120px] sm:text-[160px] font-black leading-none text-primary/10 tabular-nums">
          404
        </span>
      </div>

      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6 -mt-8">
        <Search className="h-8 w-8 text-primary" />
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-3xl font-black mb-3">Page Not Found</h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
        The page you are looking for does not exist or may have been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Home className="h-4 w-4" /> Go to Homepage
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted active:scale-95 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>

      {/* Quick links */}
      <div className="mt-10 text-sm text-muted-foreground">
        <p className="mb-3 font-medium">Or explore:</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/about"   className="hover:text-primary transition-colors">About</Link>
          <Link href="/events"  className="hover:text-primary transition-colors">Events</Link>
          <Link href="/news"    className="hover:text-primary transition-colors">News</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
}
