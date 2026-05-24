import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState('');

  async function load(query?: string) {
    const d = await apiFetch<any>(`/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    setUsers(d.users);
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load users'));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Create and manage invite-only AutoBidGo contributor accounts.</CardDescription>
            </div>
            <Link to="/admin/users/new">
              <Button>Create user</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, phone, name…" />
            <Button variant="secondary" onClick={() => load(q).catch((err) => toast.error(err.message))}>
              Search
            </Button>
          </div>

          <div className="space-y-2">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/admin/users/${u.id}`}
                className="block rounded-2xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName}` : 'Unnamed contributor'}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">{u.email || u.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{u.status}</Badge>
                    <Badge variant="neutral">${u.balance?.availableBalance ?? 0}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
