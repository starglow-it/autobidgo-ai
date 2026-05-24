import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';

export function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});

  async function load() {
    const d = await apiFetch<any>('/api/admin/withdrawals');
    setWithdrawals(d.withdrawals);
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load withdrawals'));
  }, []);

  async function setStatus(id: string, status: string) {
    try {
      await apiFetch(`/api/admin/withdrawals/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, adminNote: note[id] || null })
      });
      toast.success('Updated');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not update');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Withdrawals</CardTitle>
          <CardDescription>Track and update payout coordination for AutoBidGo contributors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {withdrawals.map((w) => (
            <div key={w.id} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-100">${w.amount}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {w.user?.profile?.firstName
                      ? `${w.user.profile.firstName} ${w.user.profile.lastName}`
                      : w.user?.email || w.user?.phone}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(w.createdAt).toLocaleString()}</div>
                </div>
                <Badge>{w.status}</Badge>
              </div>

              {w.userMessage ? (
                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">User message:</span> {w.userMessage}
                </div>
              ) : null}

              <div>
                <label className="text-sm text-slate-300">Admin note</label>
                <Textarea
                  rows={2}
                  value={note[w.id] ?? w.adminNote ?? ''}
                  onChange={(e) => setNote((m) => ({ ...m, [w.id]: e.target.value }))}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setStatus(w.id, 'contacted')}>
                  Mark contacted
                </Button>
                <Button onClick={() => setStatus(w.id, 'paid')}>Mark paid</Button>
                <Button variant="danger" onClick={() => setStatus(w.id, 'rejected')}>
                  Reject
                </Button>
              </div>
            </div>
          ))}

          {withdrawals.length === 0 ? <div className="text-sm text-slate-400">No withdrawal requests.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
