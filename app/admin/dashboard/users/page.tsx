'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (id: string, role: 'admin' | 'editor') => {
    setUpdating(id + 'role');
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Role updated.'); fetchUsers(); }
    setUpdating(null);
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    setUpdating(id + 'active');
    const { error } = await supabase.from('profiles').update({ is_active: !is_active }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(`User ${is_active ? 'deactivated' : 'activated'}.`); fetchUsers(); }
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage staff accounts and roles. New users are created via direct Supabase Auth invitation.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          No staff users found.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {formatDateTime(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        onValueChange={(v) => updateRole(u.id, v as 'admin' | 'editor')}
                        disabled={updating === u.id + 'role'}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          disabled={updating === u.id + 'active'}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            u.is_active
                              ? 'hover:bg-red-100 hover:text-red-700'
                              : 'hover:bg-green-100 hover:text-green-700'
                          }`}
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {updating === u.id + 'active'
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : u.is_active
                              ? <ShieldOff className="h-3.5 w-3.5" />
                              : <ShieldCheck className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
