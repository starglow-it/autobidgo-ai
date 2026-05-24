import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function AdminBatchDetail() {
  const { id } = useParams();
  const [batch, setBatch] = useState<any>(null);

  async function load() {
    const d = await apiFetch<any>(`/api/admin/batches/${id}`);
    setBatch(d.batch);
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load batch'));
  }, [id]);

  async function approveBatch() {
    try {
      await apiFetch(`/api/admin/batches/${id}/approve`, { method: 'POST' });
      toast.success('Batch approved');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not approve batch');
    }
  }

  async function unlockNext() {
    try {
      await apiFetch(`/api/admin/batches/${id}/unlock-next`, { method: 'POST' });
      toast.success('Next batch unlocked');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not unlock next batch');
    }
  }

  if (!batch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  const allApproved = batch.recordings?.filter((r: any) => r.status === 'approved').length >= batch.totalScripts;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Batch {batch.batchNumber}</CardTitle>
              <CardDescription>
                {batch.user?.profile?.firstName
                  ? `${batch.user.profile.firstName} ${batch.user.profile.lastName}`
                  : batch.user?.email || batch.user?.phone}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{batch.status}</Badge>
              <Button onClick={approveBatch} disabled={!allApproved}>
                Approve batch
              </Button>
              <Button variant="secondary" onClick={unlockNext} disabled={batch.status !== 'approved'}>
                Unlock next batch
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Submitted</div>
            <div className="mt-2 text-2xl font-semibold">{batch.submittedCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Approved</div>
            <div className="mt-2 text-2xl font-semibold">{batch.approvedCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Rejected</div>
            <div className="mt-2 text-2xl font-semibold">{batch.rejectedCount}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recordings in this batch</CardTitle>
          <CardDescription>Approve/reject from the recording review page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {batch.recordings?.length ? (
            batch.recordings.map((r: any) => (
              <Link
                key={r.id}
                to={`/admin/recordings/${r.id}`}
                className="block rounded-2xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{r.script?.title}</div>
                    <div className="mt-1 text-xs text-slate-500">Script {r.script?.orderIndex}</div>
                  </div>
                  <Badge>{r.status}</Badge>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-sm text-slate-400">No recordings yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
