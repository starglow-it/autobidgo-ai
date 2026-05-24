import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import type { AuthUser } from '../types';

type Props = { mode: 'user' | 'admin' };

export function Login({ mode }: Props) {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ user: AuthUser }>(`/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      await refresh();

      if (mode === 'admin' && data.user.role !== 'admin') {
        toast.error('This account does not have admin access.');
        return;
      }

      if (data.user.role === 'admin') {
        nav('/admin/dashboard');
        return;
      }

      if (data.user.mustChangePassword) {
        nav('/change-password');
        return;
      }

      if (!data.user.isProfileComplete) {
        nav('/profile-setup');
        return;
      }

      nav('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const title = mode === 'admin' ? 'Admin Login' : 'Log In';
  const note =
    mode === 'admin'
      ? 'Admin access is restricted. Use authorized credentials.'
      : 'Access to AutoBidGo is invite-only. Please use the credentials provided by your invitation manager.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{note}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-slate-300">Email or phone number</label>
              <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm text-slate-300">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
