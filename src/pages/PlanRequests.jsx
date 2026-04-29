import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ClipboardList, ChevronLeft, CheckCircle2, Clock, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
};

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  delivered: CheckCircle2,
};

const ADMIN_EMAIL = 'blueprintfc7@gmail.com';

export default function PlanRequests() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [planText, setPlanText] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u.email !== ADMIN_EMAIL) window.location.href = '/';
    });
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['plan-requests'],
    queryFn: () => base44.entities.PlanRequest.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlanRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-requests'] }),
  });

  const handleStatusChange = (req, status) => {
    updateMutation.mutate({ id: req.id, data: { status } });
  };

  const handleSendPlan = async (req) => {
    if (!planText.trim()) return toast.error('Write the plan first');
    await base44.integrations.Core.SendEmail({
      to: req.created_by,
      subject: 'Your Blueprint Training Plan is ready!',
      body: `Hi there!\n\nYour personalised training plan is ready. Here it is:\n\n${planText}\n\nTrain hard. Get better.\n— Blueprint FC`,
    });
    updateMutation.mutate({ id: req.id, data: { status: 'delivered', notes: planText } });
    toast.success('Plan sent to ' + req.created_by);
    setSelected(null);
    setPlanText('');
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/account">
          <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Plan Requests</h1>
          <p className="text-sm text-muted-foreground">{requests.length} total requests</p>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No plan requests yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((req) => {
          const StatusIcon = statusIcons[req.status] || Circle;
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{req.created_by}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {req.created_date ? format(new Date(req.created_date), 'MMM d, yyyy') : ''}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 ${statusColors[req.status] || 'bg-muted text-muted-foreground'}`}>
                  <StatusIcon className="w-3 h-3" />
                  {req.status}
                </span>
              </div>

              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Goal:</span> {req.goal}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Position: {req.position}</span>
                  {req.age && <span>Age: {req.age}</span>}
                  <span>Level: {req.current_level}</span>
                  <span>{req.days_per_week} days/week</span>
                </div>
                {req.notes && <p className="text-xs text-muted-foreground">Notes: {req.notes}</p>}
              </div>

              <div className="flex gap-2 pt-1">
                <Select value={req.status} onValueChange={(v) => handleStatusChange(req, v)}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-8 text-xs gradient-blue text-white"
                  onClick={() => { setSelected(req); setPlanText(''); }}
                >
                  Send plan
                </Button>
              </div>

              {selected?.id === req.id && (
                <div className="space-y-2 pt-1 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Write the training plan</p>
                  <Textarea
                    rows={6}
                    placeholder="Write the personalised training plan here..."
                    value={planText}
                    onChange={(e) => setPlanText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
                    <Button size="sm" className="flex-1 gradient-blue text-white" onClick={() => handleSendPlan(req)}>
                      Send to player
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
