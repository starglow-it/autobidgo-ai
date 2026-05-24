import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function About() {
  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>About AutoBidGo</CardTitle>
          <CardDescription>Invite-only AI voice training designed for quality, clarity, and trust.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-300">
          <p>
            AutoBidGo is an invite-only AI training platform designed to collect high-quality voice recordings for artificial
            intelligence development. Contributors complete guided reading tasks, record their voice securely, and submit each
            recording for quality review.
          </p>
          <p>
            Every approved script helps improve AI systems while giving contributors a transparent way to track their progress
            and earnings. AutoBidGo’s workflow is structured: one script at a time, clear guidelines, and a consistent review
            process.
          </p>
          <p>
            If you would like to participate, you must receive credentials from an authorized AutoBidGo invitation manager.
            There is no public registration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
