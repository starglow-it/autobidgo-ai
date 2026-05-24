import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type BalanceData = {
  balance: {
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarned: number;
    lifetimePaid: number;
  };
  counts: {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
  withdrawals: Array<{ id: string; amount: number; status: string; createdAt: string }>;
  transactions: Array<{ id: string; type: string; amount: number; status: string; description: string | null; createdAt: string }>;
};

export function Balance() {
  const [data, setData] = useState<BalanceData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiFetch<BalanceData>('/api/balance');
        setData(d);
      } catch (err: any) {
        toast.error(err.message || 'Could not load balance');
      }
    })();
  }, []);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
          <CardDescription>Loading your AutoBidGo earnings…</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
          <CardDescription>Approved scripts add to your available balance. Pending review is shown separately.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Available</div>
            <div className="mt-2 text-2xl font-semibold">${data.balance.availableBalance}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Pending</div>
            <div className="mt-2 text-2xl font-semibold">${data.balance.pendingBalance}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Lifetime earned</div>
            <div className="mt-2 text-2xl font-semibold">${data.balance.lifetimeEarned}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">Lifetime paid</div>
            <div className="mt-2 text-2xl font-semibold">${data.balance.lifetimePaid}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Counts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="success">Approved: {data.counts.approvedCount}</Badge>
          <Badge variant="warning">Pending review: {data.counts.pendingCount}</Badge>
          <Badge variant="danger">Rejected: {data.counts.rejectedCount}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.withdrawals.length === 0 ? (
            <div className="text-sm text-slate-400">No withdrawals yet.</div>
          ) : (
            data.withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                <div className="text-sm text-slate-200">${w.amount}</div>
                <Badge>{w.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.transactions.length === 0 ? (
            <div className="text-sm text-slate-400">No transactions yet.</div>
          ) : (
            data.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                <div>
                  <div className="text-sm text-slate-200">{t.description || t.type}</div>
                  <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-semibold ${t.amount >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>{t.amount >= 0 ? `+$${t.amount}` : `-$${Math.abs(t.amount)}`}</div>
                  <Badge>{t.status}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
