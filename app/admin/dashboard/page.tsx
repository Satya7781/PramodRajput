'use client';

import { useEffect, useState } from 'react';
import { stats as statsApi, auditLogs } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { CalendarDays, ClipboardList, Award, Newspaper, ImageIcon, Video, Users, TrendingUp, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface DashboardStats {
  totalEvents: number; activeEvents: number;
  totalRegistrations: number; pendingRegistrations: number;
  certificatesGenerated: number; newsArticles: number;
  photoAlbums: number; videos: number;
}

interface RecentActivity {
  id: string; action: string; created_at: string; user_name?: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, logs] = await Promise.all([
          statsApi.get(),
          auditLogs.list({ limit: 10 }),
        ]);
        setStats(s);
        setRecentActivity(logs as RecentActivity[]);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

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
                    <p className="text-sm font-medium">{activity.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground">{activity.user_name || 'System'}</p>
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
