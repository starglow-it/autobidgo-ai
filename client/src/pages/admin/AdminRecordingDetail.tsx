import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch, apiUrl } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';

export function AdminRecordingDetail() {
  const { id } = useParams();
  const [recording, setRecording] = useState<any>(null);
  const [reason, setReason] = useState('');

  const audioUrl = useMemo(() => (id ? `${apiUrl()}/api/files/recordings/${id}` : null), [id]);

  async function load() {
    const d = await apiFetch<any>(`/api/admin/recordings/${id}`);
    setRecording(d.recording);
    setReason(d.recording?.rejectionReason || '');
  }

  useEffect(() => {
    load().catch((err) => toast.error(err.message || 'Could not load recording'));
  }, [id]);

  async function approve() {
    try {
      await apiFetch(`/api/admin/recordings/${id}/approve`, { method: 'POST' });
      toast.success('Approved');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not approve');
    }
  }

  async function reject() {
    try {
      await apiFetch(`/api/admin/recordings/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      toast.success('Rejected');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not reject');
    }
  }

  if (!recording) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recording</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Submission details</CardTitle>
          <CardDescription>
            {recording.user?.profile?.firstName
              ? `${recording.user.profile.firstName} ${recording.user.profile.lastName}`
              : recording.user?.email || recording.user?.phone}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Batch {recording.batch?.batchNumber}</Badge>
            <Badge>Script {recording.script?.orderIndex}</Badge>
            <Badge>{recording.status}</Badge>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-sm font-semibold">Script</div>
            <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">{recording.script?.body}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review</CardTitle>
          <CardDescription>Listen to audio, then approve or reject with a clear reason.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <audio controls className="w-full" src={audioUrl || undefined} />
            <div className="mt-2 text-xs text-slate-500">Download: open in a new tab to save the file.</div>
          </div>

          <div>
            <label className="text-sm text-slate-300">Rejection reason</label>
            <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what must be fixed…" />
          </div>

          <div className="flex gap-2">
            <Button onClick={approve}>Approve</Button>
            <Button variant="danger" onClick={reject}>
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
