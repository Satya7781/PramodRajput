'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/journey', label: 'Journey' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/events', label: 'Events' },
  { href: '/news', label: 'News' },
  {
    href: '/gallery',
    label: 'Gallery',
    children: [
      { href: '/gallery/photos', label: 'Photos' },
      { href: '/gallery/videos', label: 'Videos' },
    ],
  },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            PR
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight text-foreground">Pramod Rajput</span>
            <span className="block text-xs text-muted-foreground leading-none">Serving People, Building Tomorrow</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                    isActive(link.href) && 'text-primary'
                  )}
                >
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-44 rounded-lg border border-border bg-popover p-1 shadow-lg">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors',
                          isActive(child.href) && 'text-primary font-medium'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                  isActive(link.href) && 'text-primary'
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/certificate/verify"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Verify Certificate
          </Link>
          <Link
            href="/admin"
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            Staff Login
          </Link>
        </div>

        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href}>
                  <button
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => setGalleryOpen(!galleryOpen)}
                  >
                    {link.label}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', galleryOpen && 'rotate-180')} />
                  </button>
                  {galleryOpen && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted',
                    isActive(link.href) && 'text-primary'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-2 border-t border-border space-y-1">
              <Link
                href="/certificate/verify"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                Verify Certificate
              </Link>
              <Link
                href="/admin"
                className="block rounded-md px-3 py-2 text-sm font-medium text-secondary"
                onClick={() => setMobileOpen(false)}
              >
                Staff Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
