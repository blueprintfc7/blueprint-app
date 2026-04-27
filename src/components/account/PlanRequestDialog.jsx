import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function PlanRequestDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({
    goal: '', position: 'any', age: '', current_level: 'intermediate',
    days_per_week: 3, duration_weeks: 4, notes: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.goal.trim()) return toast.error('Please describe your goal');
    setSaving(true);
    const user = await base44.auth.me();
    const requestData = { ...form, age: form.age ? parseInt(form.age) : undefined };
    await base44.entities.PlanRequest.create(requestData);
    await base44.integrations.Core.SendEmail({
      to: 'blueprintfc7@gmail.com',
      subject: `New Training Plan Request from ${user.full_name || user.email}`,
      body: `New plan request received:\n\nName: ${user.full_name || 'Unknown'}\nEmail: ${user.email}\n\nGoal: ${form.goal}\nPosition: ${form.position}\nAge: ${form.age || 'Not specified'}\nLevel: ${form.current_level}\nDays/week: ${form.days_per_week}\nNotes: ${form.notes || 'None'}`,
    });
    setSaving(false);
    toast.success("Plan requested. We'll be in touch.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Request a plan</DialogTitle>
          <DialogDescription>Tell us your goals. We'll build a custom long-term program for you.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Goal</Label>
            <Textarea
              placeholder="e.g. Improve my left foot and first touch"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Position</Label>
              <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="defender">Defender</SelectItem>
                  <SelectItem value="midfielder">Midfielder</SelectItem>
                  <SelectItem value="forward">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Level</Label>
              <Select value={form.current_level} onValueChange={(v) => setForm({ ...form, current_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Days/week</Label>
              <Input
                type="number" min="1" max="7"
                value={form.days_per_week}
                onChange={(e) => setForm({ ...form, days_per_week: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>
          <Button onClick={submit} disabled={saving} className="w-full gradient-blue text-white h-11 rounded-xl">
            {saving ? 'Sending...' : 'Send request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
