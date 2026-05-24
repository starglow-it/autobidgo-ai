import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function Terms() {
  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>AutoBidGo Terms of Service</CardTitle>
          <CardDescription>Program rules for invite-only contributor access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-300">
          <p>
            AutoBidGo is invite-only. Accounts are created by authorized admins and cannot be registered publicly.
          </p>
          <p>
            Contributors must provide accurate profile information and submit only their own original voice recordings.
            Contributors must not submit synthetic, manipulated, copied, or fraudulent audio.
          </p>
          <p>
            Payments are based only on approved recordings. AutoBidGo may reject low-quality, incomplete, inaccurate, or
            suspicious submissions.
          </p>
          <p>
            AutoBidGo may disable access for misuse, policy violations, or repeated low-quality submissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
