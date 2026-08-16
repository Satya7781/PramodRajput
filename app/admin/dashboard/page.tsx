'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { CalendarDays, ClipboardList, Award, Newspaper, ImageIcon, Video, Users, TrendingUp, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  certificatesGenerated: number;
  newsArticles: number;
  photoAlbums: number;
  videos: number;
}

interface RecentActivity {
  id: string;
  action: string;
  created_at: string;
  profiles?: { full_name: string } | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        eventsRes,
        activeEventsRes,
        regRes,
        pendingRes,
        certRes,
        newsRes,
        albumsRes,
        videosRes,
      ] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).in('status', ['published', 'registration_open']),
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('photo_albums').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalEvents: eventsRes.count || 0,
        activeEvents: activeEventsRes.count || 0,
        totalRegistrations: regRes.count || 0,
        pendingRegistrations: pendingRes.count || 0,
        certificatesGenerated: certRes.count || 0,
        newsArticles: newsRes.count || 0,
        photoAlbums: albumsRes.count || 0,
        videos: videosRes.count || 0,
      });

      const { data: activity } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity((activity || []) as RecentActivity[]);
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: CalendarDays, color: 'text-primary' },
    { label: 'Active Events', value: stats?.activeEvents || 0, icon: TrendingUp, color: 'text-secondary' },
    { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: ClipboardList, color: 'text-primary' },
    { label: 'Pending Registrations', value: stats?.pendingRegistrations || 0, icon: ClipboardList, color: 'text-accent' },
    { label: 'Certificates Generated', value: stats?.certificatesGenerated || 0, icon: Award, color: 'text-secondary' },
    { label: 'News Articles', value: stats?.newsArticles || 0, icon: Newspaper, color: 'text-primary' },
    { label: 'Photo Albums', value: stats?.photoAlbums || 0, icon: ImageIcon, color: 'text-accent' },
    { label: 'Videos', value: stats?.videos || 0, icon: Video, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's an overview of your platform.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${stat.color.includes('primary') ? 'primary' : stat.color.includes('secondary') ? 'secondary' : 'accent'}/10`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-border">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.profiles?.full_name || 'System'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No recent activity.</div>
        )}
      </div>
    </div>
  );
}
