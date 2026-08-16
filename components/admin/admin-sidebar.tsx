'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Award,
  Newspaper,
  ImageIcon,
  Video,
  Users,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/dashboard/registrations', label: 'Registrations', icon: ClipboardList },
  { href: '/admin/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/dashboard/news', label: 'News', icon: Newspaper },
  { href: '/admin/dashboard/photos', label: 'Photos', icon: ImageIcon },
  { href: '/admin/dashboard/videos', label: 'Videos', icon: Video },
  { href: '/admin/dashboard/users', label: 'Users', icon: Users },
  { href: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/admin/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

const editorNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/news', label: 'News', icon: Newspaper },
  { href: '/admin/dashboard/photos', label: 'Photos', icon: ImageIcon },
  { href: '/admin/dashboard/videos', label: 'Videos', icon: Video },
];

export function AdminSidebar({ userRole }: { userRole: 'admin' | 'editor' }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const nav = userRole === 'admin' ? adminNav : editorNav;

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 border-r border-border bg-card transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              PR
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-3">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
