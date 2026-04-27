import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame, CheckCircle2, Calendar as CalIcon, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StreakDisplay from '@/components/blueprint/StreakDisplay';

export default function Blueprint() {
  const [user, setUser] = useState(null);
  const [month, setMonth] = useState(new Date());

  const loadUser = () => base44.auth.me().then(setUser).catch(() => {});

  useEffect(() => {
    loadUser();
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', user?.email],
    queryFn: () => base44.entities.Session.filter({ user_email: user.email }, '-date', 200),
    enabled: !!user?.email,
    initialData: [],
  });

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const firstDayOffset = startOfMonth(month).getDay();

  const getSession = (day) => sessions.find((s) => isSameDay(new Date(s.date), day));

  const completedSessions = sessions.filter((s) => s.completed);
  const completedCount = completedSessions.length;
  const totalPoints = sessions.reduce((sum, s) => sum + (s.points_earned || 0), 0);
  const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const totalDrills = completedSessions.reduce((sum, s) => sum + (s.drill_ids?.length || 0), 0);

  return (
    <div className="px-5 pt-8 pb-6 space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Your journey</p>
        <h1 className="text-4xl font-bold font-display tracking-tight mt-1">Blueprint</h1>
      </div>

      {/* Streak */}
      <StreakDisplay user={user} onUserUpdate={loadUser} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={CheckCircle2} label="Sessions done" value={completedCount} />
        <StatCard icon={Flame} label="Day streak" value={user?.streak_days || 0} />
        <StatCard icon={Clock} label="Total minutes" value={totalMinutes} />
        <StatCard icon={Target} label="Drills completed" value={totalDrills} />
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-display font-semibold text-lg">{format(month, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const session = getSession(day);
            const today = isToday(day);
            return (
              <motion.div
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs relative transition-all ${
                  today
                    ? 'ring-2 ring-primary'
                    : ''
                } ${
                  session?.completed
                    ? 'gradient-blue text-white font-semibold'
                    : session?.scheduled
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                <span>{format(day, 'd')}</span>
                {session?.completed && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <LegendDot className="gradient-blue" label="Completed" />
        <LegendDot className="bg-accent" label="Scheduled" />
        <LegendDot className="bg-secondary ring-2 ring-primary" label="Today" />
      </div>

      {/* Recent sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h3 className="font-display font-semibold mb-3">Recent sessions</h3>
          <div className="space-y-2">
            {completedSessions.slice(0, 10).map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{format(new Date(s.date), 'EEE, MMM d')}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.drill_ids?.length || 0} drills · {s.duration_minutes || 0} min
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                  +{s.points_earned || 0}
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All-time summary */}
      {completedSessions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold">All-time summary</h3>
          <div className="space-y-2">
            <SummaryRow label="Total training time" value={totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`} />
            <SummaryRow label="Total drills completed" value={totalDrills} />
            <SummaryRow label="Total sessions" value={completedCount} />
            <SummaryRow label="Total points earned" value={totalPoints} />
            <SummaryRow label="Avg. drills per session" value={completedCount > 0 ? Math.round(totalDrills / completedCount) : 0} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <p className="text-2xl font-bold font-display">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold font-display">{value}</span>
    </div>
  );
}

function LegendDot({ className, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-md ${className}`} />
      <span>{label}</span>
    </div>
  );
}
