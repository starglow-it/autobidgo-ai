import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function AdminScripts() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    title: '',
    body: '',
    language: 'English',
    category: 'General',
    difficulty: 'Easy',
    estimatedDurationSeconds: 60,
    batchNumber: 1,
    orderIndex: 1
  });

  async function load() {
    const d = await apiFetch<any>('/api/admin/scripts');
    setScripts(d.scripts);
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load scripts'));
  }, []);

  async function create() {
    try {
      await apiFetch('/api/admin/scripts', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          estimatedDurationSeconds: Number(form.estimatedDurationSeconds),
          batchNumber: Number(form.batchNumber),
          orderIndex: Number(form.orderIndex)
        })
      });
      toast.success('Script created');
      setForm({ ...form, title: '', body: '' });
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not create script');
    }
  }

  async function deactivate(id: string) {
    try {
      await apiFetch(`/api/admin/scripts/${id}`, { method: 'DELETE' });
      toast.success('Script deactivated');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not deactivate');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scripts</CardTitle>
          <CardDescription>Create, edit, and deactivate AutoBidGo scripts. Each batch uses 10 scripts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Language</label>
              <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Category</label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Difficulty</label>
              <Input value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Estimated duration (seconds)</label>
              <Input
                type="number"
                value={form.estimatedDurationSeconds}
                onChange={(e) => setForm({ ...form, estimatedDurationSeconds: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Batch number</label>
              <Input type="number" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Order index</label>
              <Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Body</label>
              <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
          </div>
          <Button onClick={create}>Create script</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All scripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scripts.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{s.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Batch {s.batchNumber} · Order {s.orderIndex} · {s.language} · {s.category} · {s.difficulty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                  {s.isActive ? (
                    <Button variant="secondary" onClick={() => deactivate(s.id)}>
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
