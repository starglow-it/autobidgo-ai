import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function AdminBatches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('pending_review');

  async function load(status?: string) {
    const d = await apiFetch<any>(`/api/admin/batches${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    setBatches(d.batches);
  }

  useEffect(() => {
    load(filter).catch((err) => toast.error(err.message || 'Could not load batches'));
  }, [filter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
          <CardDescription>Approve completed batches to unlock the next batch for the contributor.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {['pending_review', 'rejected', 'approved', 'in_progress', 'available', 'locked'].map((s) => (
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
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {batches.map((b) => (
            <Link
              key={b.id}
              to={`/admin/batches/${b.id}`}
              className="block rounded-2xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/40"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-100">Batch {b.batchNumber}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {b.user?.profile?.firstName
                      ? `${b.user.profile.firstName} ${b.user.profile.lastName}`
                      : b.user?.email || b.user?.phone}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Submitted: {b.submittedCount} · Approved: {b.approvedCount} · Rejected: {b.rejectedCount}
                  </div>
                </div>
                <Badge>{b.status}</Badge>
              </div>
            </Link>
          ))}
          {batches.length === 0 ? <div className="text-sm text-slate-400">No batches found.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
