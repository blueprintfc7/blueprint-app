import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, Clock, Zap, ArrowRight, Trophy } from 'lucide-react';
import DrillVideo from '@/components/drills/DrillVideo';
import { Button } from '@/components/ui/button';
import { format, isYesterday, parseISO } from 'date-fns';
import { getMilestone } from '@/components/blueprint/StreakDisplay';

export default function StartSession() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const equipmentStr = params.get('equipment') || '';
  const filters = {
    duration: parseInt(params.get('duration') || '45'),
    players: parseInt(params.get('players') || '1'),
    equipment: equipmentStr ? equipmentStr.split(',').filter(Boolean) : [],
    space: params.get('space') || 'quarter_pitch',
  };

  const [user, setUser] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: drills = [], isLoading } = useQuery({
    queryKey: ['drills'],
    queryFn: () => base44.entities.Drill.list(),
  });

  const spaceOrder = { bedroom: 0, less_than_quarter_pitch: 1, quarter_pitch: 2, half_pitch: 3, three_quarter_pitch: 4, full_pitch: 5 };

  const session = useMemo(() => {
    const ok = drills.filter((d) => {
      const playersOk = (d.min_players ?? 1) <= filters.players && (d.max_players ?? 99) >= filters.players;
      const equipOk =
        filters.equipment.length === 0 ||
        !d.equipment_tags ||
        d.equipment_tags.length === 0 ||
        d.equipment_tags.every((tag) => filters.equipment.includes(tag));
      const drillSpace = spaceOrder[d.space_required] ?? 0;
      const userSpace = spaceOrder[filters.space] ?? 0;
      const spaceOk = drillSpace <= userSpace;
      return playersOk && equipOk && spaceOk;
    });
    const shuffled = [...ok].sort(() => Math.random() - 0.5);
    const picks = [];
    let total = 0;
    for (const d of shuffled) {
      if (total + (d.duration_minutes || 10) <= filters.duration + 5) {
        picks.push(d);
        total += d.duration_minutes || 10;
      }
      if (total >= filters.duration - 5) break;
    }
    return picks;
  }, [drills, filters.duration, filters.players, filters.equipment, filters.space]);

  const current = session[stepIdx];
  const progress = session.length > 0 ? (stepIdx / session.length) * 100 : 0;

  const handleDone = () => {
    setCompleted([...completed, current.id]);
    if (stepIdx + 1 >= session.length) {
      finishSession([...completed, current.id]);
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  const handleSkip = () => {
    if (stepIdx + 1 >= session.length) {
      finishSession(completed);
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  const finishSession = async (doneIds) => {
    const points = session
      .filter((d) => doneIds.includes(d.id))
      .reduce((sum, d) => sum + (d.points || 10), 0);

    if (user?.email) {
      await base44.entities.Session.create({
        user_email: user.email,
        date: format(new Date(), 'yyyy-MM-dd'),
        completed: true,
        duration_minutes: filters.duration,
        players: filters.players,
        equipment_level: filters.equipment.join(','),
        drill_ids: doneIds,
        points_earned: points,
      });

      const newTotal = (user.total_points || 0) + points;
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastDate = user.last_session_date;
      const trainedYesterday = lastDate && isYesterday(parseISO(lastDate));
      const trainedToday = lastDate === today;

      let newStreak = user.streak_days || 0;
      if (!trainedToday) {
        newStreak = trainedYesterday ? newStreak + 1 : 1;
      }

      const milestone = getMilestone(newStreak);
      const streakTitle = milestone ? milestone.badge : null;

      await base44.auth.updateMe({
        total_points: newTotal,
        streak_days: newStreak,
        last_session_date: today,
        ...(streakTitle && { streak_title: streakTitle }),
      });
    }
    setFinished(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (session.length === 0) {
    return (
      <div className="px-5 pt-12 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold">No drills found</h2>
        <p className="text-sm text-muted-foreground">Adjust your filters and try again.</p>
        <Button onClick={() => navigate('/')}>Go back</Button>
      </div>
    );
  }

  if (finished) {
    const earnedPoints = session
      .filter((d) => completed.includes(d.id))
      .reduce((sum, d) => sum + (d.points || 10), 0);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-5 pt-16 text-center space-y-6"
      >
        <div className="w-24 h-24 mx-auto rounded-3xl gradient-blue flex items-center justify-center shadow-xl shadow-primary/40">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold">Session complete</h2>
          <p className="text-muted-foreground mt-2">
            {completed.length} of {session.length} drills finished
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Points earned</p>
          <p className="font-display text-5xl font-bold text-primary mt-1">+{earnedPoints}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => navigate('/blueprint')}>
            Blueprint
          </Button>
          <Button className="flex-1 h-12 rounded-xl gradient-blue text-white" onClick={() => navigate('/leaderboard')}>
            Leaderboard
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-6 space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            Drill {stepIdx + 1} of {session.length}
          </span>
          <button onClick={() => navigate('/')} className="text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-blue"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Drill card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="bg-card border border-border rounded-3xl p-6 space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center shadow-lg shadow-primary/30">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">
              {current.category?.replace('_', ' ')}
            </p>
            <h2 className="font-display text-3xl font-bold mt-1">{current.name}</h2>
          </div>

          {current.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {current.duration_minutes} min
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-4 h-4" />
              {current.points} pts
            </span>
          </div>

          {current.video_url && (
            <DrillVideo url={current.video_url} />
          )}

          {current.instructions?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How to</p>
              {current.instructions.map((step, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="flex-1 h-14 rounded-2xl"
        >
          Skip
        </Button>
        <Button
          onClick={handleDone}
          className="flex-1 h-14 rounded-2xl gradient-blue text-white shadow-lg shadow-primary/30"
        >
          <Check className="w-5 h-5 mr-2" />
          Done
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
