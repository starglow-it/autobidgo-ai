import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';

export function Withdraw() {
  const [available, setAvailable] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [contact, setContact] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Array<any>>([]);

  async function load() {
    const bal = await apiFetch<any>('/api/balance');
    setAvailable(bal.balance.availableBalance);
    const w = await apiFetch<any>('/api/withdrawals/me');
    setWithdrawals(w.withdrawals);
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load withdrawal data'));
  }, []);

  async function requestWithdraw() {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/api/withdrawals', {
        method: 'POST',
        body: JSON.stringify({ userMessage })
      });

      toast.success('Withdrawal requested');
      setContact(res.contact);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not request withdrawal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>
            When you request payment, AutoBidGo will create a withdrawal request and show your invitation manager’s contact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Available balance</div>
              <div className="mt-1 text-2xl font-semibold">${available ?? '—'}</div>
            </div>
            <Button onClick={requestWithdraw} disabled={loading || !available || available <= 0}>
              {loading ? 'Submitting…' : 'Withdraw'}
            </Button>
          </div>

          <div>
            <label className="text-sm text-slate-300">Message to admin (optional)</label>
            <Textarea value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Any helpful details for payout coordination…" />
          </div>

          {contact ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Invitation manager</div>
              <div className="mt-2 text-sm text-slate-300">{contact.displayName}</div>
              <div className="mt-1 text-sm text-slate-300">Email: {contact.email}</div>
              {contact.phone ? <div className="mt-1 text-sm text-slate-300">Phone: {contact.phone}</div> : null}
              {contact.whatsapp ? <div className="mt-1 text-sm text-slate-300">WhatsApp: {contact.whatsapp}</div> : null}
              <div className="mt-3 text-xs text-slate-400">To request payment, please contact your invitation manager.</div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your withdrawal requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {withdrawals.length === 0 ? (
            <div className="text-sm text-slate-400">No withdrawal requests yet.</div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                <div className="text-sm text-slate-200">${w.amount}</div>
                <Badge>{w.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
