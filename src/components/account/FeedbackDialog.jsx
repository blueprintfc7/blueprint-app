import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackDialog({ open, onOpenChange }) {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('suggestion');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!message.trim()) return toast.error('Please write your feedback');
    setSaving(true);
    await base44.entities.Feedback.create({ message, rating, category });
    setSaving(false);
    setMessage('');
    toast.success('Thanks for the feedback!');
    onOpenChange(false);
  };

  const cats = [
    { id: 'bug', label: 'Bug' },
    { id: 'suggestion', label: 'Suggestion' },
    { id: 'compliment', label: 'Compliment' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Feedback</DialogTitle>
          <DialogDescription>Help us make Blueprint better.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      n <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Category</Label>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    category === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={4}
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={saving} className="w-full gradient-blue text-white h-11 rounded-xl">
            {saving ? 'Sending...' : 'Send feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
