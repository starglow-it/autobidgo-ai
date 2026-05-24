import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { apiFetch, apiUrl } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';

type TrainingState =
  | {
      batch: null;
      state: 'no_batch';
      message: string;
    }
  | {
      batch: { id: string; batchNumber: number; status: string };
      state: 'batch_pending_review';
      message: string;
    }
  | {
      batch: {
        id: string;
        batchNumber: number;
        status: string;
        totalScripts: number;
        submittedCount: number;
        approvedCount: number;
        rejectedCount: number;
        pendingReviewCount: number;
      };
      script: {
        id: string;
        title: string;
        body: string;
        instructions: string;
        estimatedDurationSeconds: number;
        orderIndex: number;
      };
      recording: null | {
        id: string;
        status: string;
        rejectionReason?: string | null;
        submittedAt?: string | null;
      };
    };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Training() {
  const [data, setData] = useState<TrainingState | null>(null);
  const [loading, setLoading] = useState(true);

  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const intervalRef = useRef<number | null>(null);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioUrl = useMemo(() => (audioBlob ? URL.createObjectURL(audioBlob) : null), [audioBlob]);

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch<TrainingState>('/api/training/current-script');
      setData(d);
    } catch (err: any) {
      toast.error(err.message || 'Could not load training');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission('granted');
      streamRef.current = stream;
      return stream;
    } catch {
      setPermission('denied');
      throw new Error('Microphone permission was denied.');
    }
  }

  async function startRecording() {
    try {
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = streamRef.current ?? (await requestMic());

      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      setIsRecording(true);
      setTimer(0);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => setTimer((t) => t + 1), 1000);
    } catch (err: any) {
      toast.error(err.message || 'Could not start recording');
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setIsRecording(false);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  async function submit() {
    if (!audioBlob) {
      toast.error('Record audio before submitting.');
      return;
    }

    const d: any = data;
    if (!d?.script?.id) return;

    try {
      const form = new FormData();
      form.append('scriptId', d.script.id);
      form.append('durationSeconds', String(timer));
      form.append('audio', audioBlob, 'recording.webm');

      const res = await fetch(`${apiUrl()}/api/training/recordings`, {
        method: 'POST',
        body: form,
        credentials: 'include'
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Upload failed');

      toast.success('Recording submitted');
      setAudioBlob(null);
      setTimer(0);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not submit recording');
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge variant="success">Approved</Badge>;
    if (status === 'pending_review') return <Badge variant="warning">Pending Review</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
    if (status === 'recording') return <Badge variant="danger">Recording</Badge>;
    return <Badge>Not Started</Badge>;
  };

  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training</CardTitle>
          <CardDescription>Loading your current AutoBidGo script…</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  if ('state' in data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training</CardTitle>
          <CardDescription>{data.state === 'batch_pending_review' ? 'Batch under review' : 'Not ready yet'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-slate-300">{data.message}</div>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = (data.batch.submittedCount / data.batch.totalScripts) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch {data.batch.batchNumber}</CardTitle>
          <CardDescription>Read one script at a time. You can preview and re-record before submitting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">
              Progress: {data.batch.submittedCount} / {data.batch.totalScripts} submitted
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(isRecording ? 'recording' : data.recording?.status || 'not_started')}
              <Badge>Script {data.script.orderIndex} / {data.batch.totalScripts}</Badge>
            </div>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{data.script.title}</CardTitle>
          <CardDescription>{data.script.instructions}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.recording?.status === 'rejected' ? (
            <div className="rounded-2xl border border-rose-900/50 bg-rose-950/30 p-4 text-sm text-rose-200">
              <div className="font-semibold">Re-record required</div>
              <div className="mt-1">Reason: {data.recording.rejectionReason || 'No reason provided'}</div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-5">
            <div className="whitespace-pre-wrap text-slate-100 leading-relaxed text-base">{data.script.body}</div>
            <div className="mt-3 text-xs text-slate-400">Estimated speaking time: ~{Math.round(data.script.estimatedDurationSeconds / 60)} minute</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={permission === 'denied' ? 'danger' : permission === 'granted' ? 'success' : 'neutral'}>
              Mic: {permission}
            </Badge>
            <Badge>Timer: {formatTime(timer)}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={data.recording?.status === 'pending_review'}>
                Start Recording
              </Button>
            ) : (
              <Button variant="danger" onClick={stopRecording}>
                Stop Recording
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={() => {
                setAudioBlob(null);
                setTimer(0);
              }}
              disabled={isRecording || !audioBlob}
            >
              Re-record
            </Button>

            <Button onClick={submit} disabled={isRecording || !audioBlob}>
              Submit Recording
            </Button>

            <Button variant="ghost" onClick={load}>
              Next Script
            </Button>
          </div>

          {audioUrl ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Preview</div>
              <audio className="mt-2 w-full" controls src={audioUrl} />
            </div>
          ) : null}

          {data.recording?.status === 'pending_review' ? (
            <div className="text-sm text-slate-400">
              This script is pending review. You can move on only if AutoBidGo shows the next script.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
