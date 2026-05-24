import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function AdminDashboard() {
  const [cards, setCards] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiFetch<any>('/api/admin/dashboard');
        setCards(d.cards);
      } catch (err: any) {
        toast.error(err.message || 'Could not load dashboard');
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>AutoBidGo admin metrics and workflow status.</CardDescription>
        </CardHeader>
        <CardContent>
          {!cards ? (
            <div className="text-sm text-slate-400">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(cards).map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                  <div className="text-xs uppercase tracking-wider text-slate-400">{k}</div>
                  <div className="mt-2 text-2xl font-semibold">{String(v)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
