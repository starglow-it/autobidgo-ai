import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch, apiUrl } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [resetCreds, setResetCreds] = useState<any>(null);

  const photoUrl = useMemo(() => (id ? `${apiUrl()}/api/files/photos/${id}` : null), [id]);

  async function load() {
    const d = await apiFetch<any>(`/api/admin/users/${id}`);
    setUser(d.user);
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load user'));
  }, [id]);

  async function resetPassword() {
    try {
      const d = await apiFetch<any>(`/api/admin/users/${id}/reset-password`, { method: 'POST' });
      setResetCreds(d.temporaryCredentials);
      toast.success('Password reset');
    } catch (err: any) {
      toast.error(err.message || 'Could not reset password');
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>
                {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Contributor'}
              </CardTitle>
              <CardDescription>{user.email || user.phone}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={resetPassword}>
                Reset password
              </Button>
              {user.status !== 'disabled' ? (
                <Button
                  variant="danger"
                  onClick={() =>
                    apiFetch(`/api/admin/users/${id}/disable`, { method: 'POST' })
                      .then(load)
                      .catch((err) => toast.error(err.message))
                  }
                >
                  Disable
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    apiFetch(`/api/admin/users/${id}/enable`, { method: 'POST' })
                      .then(load)
                      .catch((err) => toast.error(err.message))
                  }
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
                  {photoUrl ? <img src={photoUrl} className="h-full w-full object-cover" /> : null}
                </div>
                <div>
                  <div className="text-sm font-semibold">Status</div>
                  <div className="mt-1">
                    <Badge>{user.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Balance</div>
              <div className="mt-2 text-sm text-slate-300">Available: ${user.balance?.availableBalance ?? 0}</div>
              <div className="mt-1 text-sm text-slate-300">Lifetime earned: ${user.balance?.lifetimeEarned ?? 0}</div>
              <div className="mt-1 text-sm text-slate-300">Lifetime paid: ${user.balance?.lifetimePaid ?? 0}</div>
            </div>

            {resetCreds ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-200 whitespace-pre-wrap">
                <div className="font-semibold">Temporary password (shown once)</div>
                <div className="mt-2">Login URL: {resetCreds.loginUrl}</div>
                <div>Email/Phone: {resetCreds.identifier}</div>
                <div>Temporary Password: {resetCreds.temporaryPassword}</div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.batches?.map((b: any) => (
                  <Link
                    key={b.id}
                    to={`/admin/batches/${b.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3"
                  >
                    <div className="text-sm text-slate-200">Batch {b.batchNumber}</div>
                    <Badge>{b.status}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent recordings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.recordings?.slice(0, 10).map((r: any) => (
                  <Link
                    key={r.id}
                    to={`/admin/recordings/${r.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-200">{r.script?.title || 'Script'}</div>
                      <Badge>{r.status}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Batch {r.batch?.batchNumber}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
