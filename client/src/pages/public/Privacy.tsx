import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function Privacy() {
  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>AutoBidGo Privacy Policy</CardTitle>
          <CardDescription>How AutoBidGo collects, uses, and protects contributor information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-300">
          <p>
            AutoBidGo collects account information, profile details, uploaded photos, voice recordings, payment-related
            information, and usage activity. This data supports contributor onboarding, task completion, quality review, and
            payment coordination.
          </p>
          <p>
            Voice recordings may be reviewed by authorized AutoBidGo admins for quality control. Approved recordings may be
            used for AI training, evaluation, and improvement.
          </p>
          <p>
            AutoBidGo aims to protect personal information and use it only for platform operation, contributor management,
            payment coordination, and legal compliance. Access is limited to authorized personnel.
          </p>
          <p>
            If you have questions about your data or payments, contact your AutoBidGo invitation manager.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
