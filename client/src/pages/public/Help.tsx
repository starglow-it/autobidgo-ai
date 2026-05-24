import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function Help() {
  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>AutoBidGo Recording Guidelines</CardTitle>
          <CardDescription>Follow these guidelines to increase approval speed and accuracy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-300">
          <ul className="list-disc pl-5 space-y-2">
            <li>Find a quiet place before recording.</li>
            <li>Read the full script exactly as shown.</li>
            <li>Speak naturally and clearly, at a steady pace.</li>
            <li>Do not skip, change, or add words.</li>
            <li>Do not use text-to-speech or synthetic voice tools.</li>
            <li>Preview your recording before submitting.</li>
            <li>Re-record if there is background noise or mistakes.</li>
          </ul>
          <p className="text-sm text-slate-400">
            AutoBidGo reviews recordings for clarity, completeness, and script accuracy. High-quality audio helps the review
            team approve faster.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
