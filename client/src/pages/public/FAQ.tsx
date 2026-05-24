import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function QA({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-5">
      <div className="font-semibold text-slate-100">{q}</div>
      <div className="mt-2 text-sm text-slate-300">{a}</div>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>AutoBidGo FAQ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QA
            q="What is AutoBidGo?"
            a="AutoBidGo is an invite-only AI training program where approved contributors record short scripts for quality review and AI improvement."
          />
          <QA
            q="How do I join AutoBidGo?"
            a="You can join only through an invitation. Your invitation manager will create your account and share login credentials."
          />
          <QA
            q="Why can’t I register myself?"
            a="AutoBidGo is invite-only to protect data quality, prevent abuse, and keep the review pipeline organized."
          />
          <QA
            q="How do I get my login credentials?"
            a="An authorized AutoBidGo admin will send you a temporary password and a login identifier (email or phone number)."
          />
          <QA
            q="Why do I need to change my password?"
            a="Temporary passwords are for first access only. AutoBidGo requires a password update on first login for account security."
          />
          <QA
            q="How much do I earn per script?"
            a="Each approved script earns $2. A fully approved batch of 10 scripts equals $20."
          />
          <QA
            q="When can I withdraw my balance?"
            a="You can request a withdrawal once you have an available balance from approved recordings."
          />
          <QA
            q="Why was my recording rejected?"
            a="Recordings may be rejected for background noise, missing words, inaccurate reading, incomplete audio, or other quality issues."
          />
          <QA
            q="How do I record high-quality audio?"
            a="Use a quiet room, speak clearly, keep a steady distance from the microphone, and re-record if there is noise or a mistake."
          />
          <QA
            q="Can I re-record a script?"
            a="Yes. You can re-record before submitting. If a submission is rejected, AutoBidGo will unlock that script for re-recording."
          />
          <QA
            q="How does AutoBidGo use my data?"
            a="Approved recordings may be used for AI training, evaluation, and improvement. Profile data supports contributor management and payment coordination."
          />
          <QA
            q="Who do I contact for payment?"
            a="When you request a withdrawal, AutoBidGo will show your invitation manager’s contact information."
          />
        </CardContent>
      </Card>
    </div>
  );
}
