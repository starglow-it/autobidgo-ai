import React, { useState } from 'react';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AdminUserNew() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState<any>(null);

  async function create() {
    setLoading(true);
    try {
      const d = await apiFetch<any>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: email || null, phone: phone || null })
      });
      setCreds(d.temporaryCredentials);
      toast.success('User created');
    } catch (err: any) {
      toast.error(err.message || 'Could not create user');
    } finally {
      setLoading(false);
    }
  }

  const copyText = creds
    ? `AutoBidGo Login Credentials\n\nLogin URL: ${creds.loginUrl}\nEmail/Phone: ${creds.identifier}\nTemporary Password: ${creds.temporaryPassword}\n\nInstructions: ${creds.instructions}`
    : '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create user</CardTitle>
          <CardDescription>Invite-only account creation. Temporary password is shown once.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Email (optional)</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contributor@example.com" />
            </div>
            <div>
              <label className="text-sm text-slate-300">Phone (optional)</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555…" />
            </div>
          </div>
          <Button disabled={loading} onClick={create}>
            {loading ? 'Creating…' : 'Create user'}
          </Button>
        </CardContent>
      </Card>

      {creds ? (
        <Card>
          <CardHeader>
            <CardTitle>Temporary credentials</CardTitle>
            <CardDescription>Copy and send to the user. The password cannot be retrieved later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-200 whitespace-pre-wrap">
              {copyText}
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(copyText);
                toast.success('Copied');
              }}
            >
              Copy Credentials
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
