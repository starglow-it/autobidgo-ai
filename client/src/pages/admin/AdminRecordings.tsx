import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function AdminRecordings() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('pending_review');

  async function load(status?: string) {
    const d = await apiFetch<any>(`/api/admin/recordings${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    setRecordings(d.recordings);
  }

  useEffect(() => {
    load(filter).catch((err) => toast.error(err.message || 'Could not load recordings'));
  }, [filter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recordings</CardTitle>
          <CardDescription>Review AutoBidGo submissions quickly: listen, approve, or reject with a reason.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {['pending_review', 'approved', 'rejected'].map((s) => (
            <Button key={s} variant={filter === s ? 'primary' : 'secondary'} onClick={() => setFilter(s)}>
              {s}
            </Button>
          ))}
          <Button variant={filter === '' ? 'primary' : 'secondary'} onClick={() => setFilter('')}>
            All
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recordings.map((r) => (
            <Link
              key={r.id}
              to={`/admin/recordings/${r.id}`}
              className="block rounded-2xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/40"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{r.script?.title}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {r.user?.profile?.firstName ? `${r.user.profile.firstName} ${r.user.profile.lastName}` : r.user?.email || r.user?.phone}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Batch {r.batch?.batchNumber} · Script {r.script?.orderIndex}</div>
                </div>
                <Badge>{r.status}</Badge>
              </div>
            </Link>
          ))}
          {recordings.length === 0 ? <div className="text-sm text-slate-400">No recordings found.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
