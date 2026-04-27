import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Package, Timer, Maximize2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterCard from '@/components/home/FilterCard';
import DrillPreview from '@/components/home/DrillPreview';
import usePullToRefresh from '@/hooks/usePullToRefresh';

// Space hierarchy — larger values include smaller spaces
const spaceOrder = { bedroom: 0, less_than_quarter_pitch: 1, quarter_pitch: 2, half_pitch: 3, three_quarter_pitch: 4, full_pitch: 5 };

export default function Home() {
  const [filters, setFilters] = useState({
    players: 1,
    equipment: [],
    duration: 45,
    space: 'quarter_pitch',
  });

  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { pulling, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries({ queryKey: ['drills'] });
    const u = await base44.auth.me().catch(() => null);
    if (u) setUser(u);
  });

  const { data: drills = [], isLoading } = useQuery({
    queryKey: ['drills'],
    queryFn: () => base44.entities.Drill.list(),
  });

  const filtered = useMemo(() => {
    return drills.filter((d) => {
      // Players
      const playersOk =
        (d.min_players ?? 1) <= filters.players && (d.max_players ?? 99) >= filters.players;

      // Equipment — if user selected nothing, match any drill;
      // otherwise the drill's equipment_tags must be a subset of what the user has
      const equipOk =
        filters.equipment.length === 0 ||
        !d.equipment_tags ||
        d.equipment_tags.length === 0 ||
        d.equipment_tags.every((tag) => filters.equipment.includes(tag));

      // Space — drill must not require more space than available
      const drillSpace = spaceOrder[d.space_required] ?? 0;
      const userSpace = spaceOrder[filters.space] ?? 0;
      const spaceOk = drillSpace <= userSpace;

      return playersOk && equipOk && spaceOk;
    });
  }, [drills, filters]);

  // Build a session that fits within the chosen duration
  const session = useMemo(() => {
    const picks = [];
    let total = 0;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    for (const d of shuffled) {
      if (total + (d.duration_minutes || 10) <= filters.duration + 5) {
        picks.push(d);
        total += d.duration_minutes || 10;
      }
      if (total >= filters.duration - 5) break;
    }
    return { drills: picks, total };
  }, [filtered, filters.duration]);

  const sessionQuery = new URLSearchParams({
    duration: filters.duration,
    players: filters.players,
    equipment: filters.equipment.join(','),
    space: filters.space,
  }).toString();

  const set = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div
      className="px-5 pt-8 pb-6 space-y-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {(pulling || refreshing) && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground">
          {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}` : 'Welcome'}
        </p>
        <h1 className="text-4xl font-bold font-display tracking-tight mt-1">
          Design your <span className="text-primary">training</span>.
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Customise the session. We'll build the perfect drills.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Players */}
        <FilterCard
          icon={Users}
          label="Number of players"
          value={filters.players}
          onChange={set('players')}
          options={[
            { value: 1, label: 'Just you' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 4, label: '4' },
          ]}
        />

        {/* Equipment — multi-select */}
        <FilterCard
          icon={Package}
          label="Equipment available"
          value={filters.equipment}
          onChange={set('equipment')}
          multi
          options={[
            { value: 'few_cones', label: 'Cones' },
            { value: 'lots_of_cones', label: 'Lots of cones' },
            { value: 'poles', label: 'Poles' },
            { value: 'wall', label: 'Wall' },
            { value: 'four_plus_balls', label: '4+ balls' },
          ]}
        />

        {/* Duration */}
        <FilterCard
          icon={Timer}
          label="Length of session"
          value={filters.duration}
          onChange={set('duration')}
          options={[
            { value: 45, label: '45 mins' },
            { value: 60, label: '1 hour' },
            { value: 90, label: '1 hr 30 mins' },
            { value: 120, label: '2 hours' },
          ]}
        />

        {/* Space */}
        <FilterCard
          icon={Maximize2}
          label="Amount of space"
          value={filters.space}
          onChange={set('space')}
          options={[
            { value: 'bedroom', label: 'Bedroom' },
            { value: 'less_than_quarter_pitch', label: '< ¼ pitch' },
            { value: 'quarter_pitch', label: '¼ pitch' },
            { value: 'half_pitch', label: '½ pitch' },
            { value: 'three_quarter_pitch', label: '¾ pitch' },
            { value: 'full_pitch', label: '4/4 pitch' },
          ]}
        />
      </div>

      {/* Session preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold">Your session</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {session.drills.length} drills · {session.total} min
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : session.drills.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No drills match these filters yet. Try adjusting them.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {session.drills.map((d, i) => (
              <DrillPreview key={d.id} drill={d} index={i} />
            ))}
          </div>
        )}

        <Link to={`/start?${sessionQuery}`} className="block mt-5">
          <Button
            disabled={session.drills.length === 0}
            className="w-full h-14 text-base rounded-2xl gradient-blue text-white shadow-lg shadow-primary/30 hover:opacity-95"
          >
            Start Session
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
