import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const MILESTONES = [
  { days: 7,   badge: '⚔️ Warrior',  title: 'warrior',  color: 'from-orange-400 to-red-500' },
  { days: 14,  badge: '🔥 Grinder',  title: 'grinder',  color: 'from-yellow-400 to-orange-500' },
  { days: 30,  badge: '💎 Elite',    title: 'elite',    color: 'from-blue-400 to-indigo-500' },
  { days: 60,  badge: '👑 Legend',   title: 'legend',   color: 'from-purple-400 to-pink-500' },
  { days: 100, badge: '🌟 Icon',     title: 'icon',     color: 'from-yellow-300 to-yellow-500' },
];

export function getMilestone(streak) {
  return [...MILESTONES].reverse().find((m) => streak >= m.days) || null;
}

export default function StreakDisplay({ user, onUserUpdate }) {
  const [restoring, setRestoring] = useState(false);
  const streak = user?.streak_days || 0;
  const isPremium = user?.is_premium;
  const milestone = getMilestone(streak);

  // Show boots: one per day, max 10 visible (then shows +N)
  const visibleBoots = Math.min(streak, 10);
  const overflow = streak > 10 ? streak - 10 : 0;

  const nextMilestone = MILESTONES.find((m) => streak < m.days);

  const handleRestoreStreak = async () => {
    setRestoring(true);
    // Simulate payment — integrate Stripe here for real money
    await new Promise((r) => setTimeout(r, 1200));
    const newStreak = (user?.streak_days || 0) + 1;
    await base44.auth.updateMe({ streak_days: newStreak });
    toast.success('Streak restored! 🛡️ Keep going!');
    setRestoring(false);
    onUserUpdate?.();
  };

  if (!isPremium) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🔥</span>
          <h3 className="font-display font-semibold">Daily Streak</h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold ml-auto">Premium</span>
        </div>
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="flex gap-1 opacity-30">
            {[...Array(5)].map((_, i) => <span key={i} className="text-2xl">👟</span>)}
          </div>
          <Lock className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">Unlock the streak system with Blueprint Premium</p>
          <Link to="/premium">
            <Button size="sm" className="gradient-blue text-white rounded-xl">Upgrade to Premium</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="font-display font-semibold">Daily Streak</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-2xl font-bold text-primary">{streak}</span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </div>

      {/* Boot tallies */}
      <div className="bg-secondary/50 rounded-xl p-3">
        <div className="flex flex-wrap gap-1 items-center">
          {[...Array(visibleBoots)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="text-2xl"
            >
              👟
            </motion.span>
          ))}
          {overflow > 0 && (
            <span className="text-sm font-bold text-primary ml-1">+{overflow} more</span>
          )}
          {streak === 0 && (
            <span className="text-sm text-muted-foreground">Complete a session today to start your streak!</span>
          )}
        </div>
      </div>

      {/* Current milestone badge */}
      {milestone && (
        <div className={`bg-gradient-to-r ${milestone.color} rounded-xl p-3 text-white text-center`}>
          <p className="font-display font-bold text-lg">{milestone.badge}</p>
          <p className="text-xs opacity-80">Current title</p>
        </div>
      )}

      {/* Next milestone progress */}
      {nextMilestone && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next: {nextMilestone.badge}</span>
            <span>{streak}/{nextMilestone.days} days</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-blue rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(streak / nextMilestone.days) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Streak Shield restore */}
      {streak === 0 && user?.streak_days_before_loss > 0 && (
        <div className="border border-dashed border-destructive/40 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            <p className="text-sm font-semibold text-destructive">Streak lost!</p>
          </div>
          <p className="text-xs text-muted-foreground">Use a Streak Shield to restore your {user.streak_days_before_loss}-day streak for $0.99</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={handleRestoreStreak}
            disabled={restoring}
          >
            {restoring ? 'Restoring...' : '🛡️ Restore Streak · $0.99'}
          </Button>
        </div>
      )}

      {/* All milestones */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milestones</p>
        <div className="flex justify-between">
          {MILESTONES.map((m) => (
            <div key={m.days} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${streak >= m.days ? `bg-gradient-to-br ${m.color} text-white` : 'bg-secondary text-muted-foreground'}`}>
                {streak >= m.days ? '✓' : m.days}
              </div>
              <span className="text-[9px] text-muted-foreground">{m.days}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
