import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';

type DashboardData = {
  user: { firstName: string };
  currentBatch: null | {
    batchNumber: number;
    status: string;
    totalScripts: number;
    submittedCount: number;
    approvedCount: number;
    rejectedCount: number;
    pendingReviewCount: number;
  };
  stats: {
    pendingReviewCount: number;
    rejectedCount: number;
    availableBalance: number;
    pendingEarnings: number;
  };
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiFetch<DashboardData>('/api/user/dashboard');
        setData(d);
      } catch (err: any) {
        toast.error(err.message || 'Could not load dashboard');
      }
    })();
  }, []);

  const progress = useMemo(() => {
    if (!data?.currentBatch) return 0;
    return (data.currentBatch.submittedCount / data.currentBatch.totalScripts) * 100;
  }, [data]);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Loading your AutoBidGo contributor summary…</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  const statusVariant = (s: string) => {
    if (s === 'approved') return 'success';
    if (s === 'pending_review') return 'warning';
    if (s === 'rejected') return 'danger';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {data.user.firstName}</CardTitle>
          <CardDescription>
            Complete 10 approved scripts to unlock the next batch. Each approved script earns $2.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Current batch</div>
            <div className="mt-1 text-lg font-semibold">
              {data.currentBatch ? `Batch ${data.currentBatch.batchNumber}` : 'Not started'}
            </div>
            <div className="mt-2">
              <Progress value={progress} />
              <div className="mt-2 text-sm text-slate-300">
                {data.currentBatch ? `${data.currentBatch.submittedCount} / ${data.currentBatch.totalScripts} submitted` : '—'}
              </div>
              {data.currentBatch ? (
                <div className="mt-2">
                  <Badge variant={statusVariant(data.currentBatch.status) as any}>{data.currentBatch.status}</Badge>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Review status</div>
            <div className="mt-2 text-sm text-slate-300">Pending review: {data.stats.pendingReviewCount}</div>
            <div className="mt-1 text-sm text-slate-300">Rejected: {data.stats.rejectedCount}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Earnings</div>
            <div className="mt-2 text-2xl font-semibold">${data.stats.availableBalance}</div>
            <div className="mt-1 text-sm text-slate-300">Pending earnings: ${data.stats.pendingEarnings}</div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Link to="/training">
                <Button>Start Reading</Button>
              </Link>
              <Link to="/balance">
                <Button variant="secondary">View Balance</Button>
              </Link>
              <Link to="/withdraw">
                <Button variant="secondary">Request Withdrawal</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How AutoBidGo approvals work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <p>
            Your recordings are reviewed for clarity, completeness, and script accuracy. Rejected recordings require a
            re-recording.
          </p>
          <p>
            After you submit 10 scripts, the batch is locked until an AutoBidGo admin completes review and approves the batch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
