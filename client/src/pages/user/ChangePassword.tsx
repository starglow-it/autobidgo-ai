import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { apiFetch } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export function ChangePassword() {
  const nav = useNavigate();
  const { user, refresh } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      await refresh();
      toast.success('Password updated');

      if (user?.role === 'admin') {
        nav('/admin/dashboard');
        return;
      }

      if (!user?.isProfileComplete) nav('/profile-setup');
      else nav('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Could not change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change your password</CardTitle>
        <CardDescription>AutoBidGo requires a password update the first time you sign in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-300">Current password</label>
            <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-300">New password</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <div className="mt-1 text-xs text-slate-400">Use at least 8 characters.</div>
          </div>
          <Button disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
