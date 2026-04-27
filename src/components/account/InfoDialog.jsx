import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const content = {
  privacy: {
    title: 'Privacy Policy',
    body: `We respect your privacy. Blueprint collects only the data needed to run the app: your account info, training sessions, and usage stats. We never sell your data.

You can request deletion of your account at any time by contacting us via the feedback form.

Profile pictures and usernames are visible on the public leaderboard. Everything else stays private.`
  },
  terms: {
    title: 'Terms of Service',
    body: `By using Blueprint you agree to train responsibly. Warm up before every session, stop if you feel pain, and consult a professional for medical advice.

We provide training content "as is" — please use common sense. Accounts that abuse the leaderboard or harass other users may be removed.

Have fun. Train smart. Get better.`
  },
};

export default function InfoDialog({ type, onClose }) {
  const data = type ? content[type] : null;
  return (
    <Dialog open={!!type} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{data?.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pr-4">
            {data?.body}
          </p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
