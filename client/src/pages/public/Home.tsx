import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function Home() {
  return (
    <div className="py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">Train AI with Your Voice</h1>
          <p className="mt-4 text-lg text-slate-300">
            AutoBidGo is an invite-only AI training platform where contributors read short scripts, submit high-quality voice
            recordings, and help improve the next generation of AI systems.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login">
              <Button>Log In</Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary">Learn More</Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-slate-400">
            Invite-only access. If you were invited, use the credentials provided by your invitation manager.
          </div>
        </div>

        <Card className="p-2">
          <CardHeader>
            <CardTitle>Why AutoBidGo?</CardTitle>
            <CardDescription>Secure workflow, transparent earnings, quality-focused reviews.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Invite-Only Access</div>
              <div className="mt-1 text-sm text-slate-300">
                Accounts are created by authorized AutoBidGo admins to keep training secure and organized.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Simple Recording Workflow</div>
              <div className="mt-1 text-sm text-slate-300">
                Read one script at a time, record, preview, and submit for review.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Transparent Earnings</div>
              <div className="mt-1 text-sm text-slate-300">
                Each approved script earns a fixed amount. Track approvals and balance in real time.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold">Quality Review</div>
              <div className="mt-1 text-sm text-slate-300">
                Recordings are reviewed for clarity, completeness, and script accuracy before approval.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
