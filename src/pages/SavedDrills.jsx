import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, BookOpen, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MobileSelect from '@/components/ui/MobileSelect';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const CATEGORIES = [
  'dribbling', 'passing', 'shooting', 'fitness', 'defending', 'first_touch', 'agility', 'custom'
];

const categoryColors = {
  dribbling: 'bg-blue-100 text-blue-700',
  passing: 'bg-green-100 text-green-700',
  shooting: 'bg-red-100 text-red-700',
  fitness: 'bg-orange-100 text-orange-700',
  defending: 'bg-purple-100 text-purple-700',
  first_touch: 'bg-yellow-100 text-yellow-700',
  agility: 'bg-pink-100 text-pink-700',
  custom: 'bg-slate-100 text-slate-700',
};

const emptyForm = { name: '', description: '', category: 'custom', duration_minutes: 15 };

export default function SavedDrills() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['saved-drills', user?.email],
    queryFn: () => base44.entities.SavedDrill.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedDrill.create({ ...data, user_email: user.email, is_custom: true }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['saved-drills', user?.email] });
      const previous = queryClient.getQueryData(['saved-drills', user?.email]);
      const optimistic = { id: `temp-${Date.now()}`, ...data, user_email: user.email, is_custom: true };
      queryClient.setQueryData(['saved-drills', user?.email], (old = []) => [optimistic, ...old]);
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Drill saved!');
      return { previous };
    },
    onError: (_err, _data, ctx) => {
      queryClient.setQueryData(['saved-drills', user?.email], ctx.previous);
      toast.error('Failed to save drill');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['saved-drills', user?.email] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedDrill.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['saved-drills', user?.email] });
      const previous = queryClient.getQueryData(['saved-drills', user?.email]);
      queryClient.setQueryData(['saved-drills', user?.email], (old = []) => old.filter((d) => d.id !== id));
      toast.success('Drill removed');
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['saved-drills', user?.email], ctx.previous);
      toast.error('Failed to remove drill');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['saved-drills', user?.email] }),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Give your drill a name');
    createMutation.mutate(form);
  };

  return (
    <div className="px-5 pt-8 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/account">
          <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-display tracking-tight">Saved Drills</h1>
          <p className="text-xs text-muted-foreground">{saved.length} drill{saved.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          size="sm"
          className="gradient-blue text-white rounded-xl"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-display font-semibold">New drill</h3>
            <Input
              placeholder="Drill name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              placeholder="Describe the drill — how it works, reps, tips..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-3">
              <MobileSelect
                className="flex-1"
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
                placeholder="Category"
                options={CATEGORIES.map((c) => ({ value: c, label: c.replace('_', ' ') }))}
              />
              <Input
                type="number"
                placeholder="Mins"
                className="w-24"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                className="flex-1 gradient-blue text-white"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Save drill'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drill list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-semibold">No saved drills yet</p>
          <p className="text-sm text-muted-foreground">Create your first custom drill above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {saved.map((drill) => (
              <motion.div
                key={drill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold">{drill.name}</h3>
                      {drill.is_custom && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {drill.category && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium capitalize ${categoryColors[drill.category] || categoryColors.custom}`}>
                          {drill.category.replace('_', ' ')}
                        </span>
                      )}
                      {drill.duration_minutes > 0 && (
                        <span className="text-xs text-muted-foreground">{drill.duration_minutes} min</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(drill.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {drill.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{drill.description}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
