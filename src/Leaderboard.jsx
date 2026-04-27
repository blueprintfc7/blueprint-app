import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Flame, Crown, Medal, Award } from 'lucide-react';
import usePullToRefresh from '@/hooks/usePullToRefresh';

const tabs = [
  { id: 'world', label: 'Worldwide' },
  { id: 'local', label: 'Near me' },
  { id: 'all_time', label: 'All time' },
];

export default function Leaderboard() {
  const [tab, setTab] = useState('world');
  const [me, setMe] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const { pulling, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries({ queryKey: ['users-leaderboard'] });
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-leaderboard'],
    queryFn: () => base44.entities.User.list('-total_points', 100),
    initialData: [],
  });

  const ranked = useMemo(() => {
    let list = users.filter((u) => (u.total_points || 0) > 0);
    if (tab === 'local' && me?.country) {
      list = list.filter((u) => u.country === me.country);
    }
    return list.sort((a, b) => (b.total_points || 0) - (a.total_points || 0)).slice(0, 50);
  }, [users, tab, me]);

  const myRank = ranked.findIndex((u) => u.email === me?.email) + 1;
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

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
      <div>
        <p className="text-sm text-muted-foreground">Compete · Climb · Conquer</p>
        <h1 className="text-4xl font-bold font-display tracking-tight mt-1">Leaderboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-2xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              tab === t.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {top3[1] && <PodiumCard user={top3[1]} rank={2} height="h-32" />}
          {top3[0] && <PodiumCard user={top3[0]} rank={1} height="h-40" />}
          {top3[2] && <PodiumCard user={top3[2]} rank={3} height="h-28" />}
        </div>
      )}

      {/* Rest of rankings */}
      <div className="space-y-2">
        {rest.map((u, i) => (
          <RankRow key={u.id} user={u} rank={i + 4} isMe={u.email === me?.email} />
        ))}
        {ranked.length === 0 && (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Be the first to score. Complete a session.
            </p>
          </div>
        )}
      </div>

      {/* My rank sticky */}
      {me && myRank > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              #{myRank}
            </div>
            <div>
              <p className="text-xs opacity-80">Your rank</p>
              <p className="font-semibold">{me.username || me.full_name || 'You'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Points</p>
            <p className="font-display font-bold text-lg">{me.total_points || 0}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PodiumCard({ user, rank, height }) {
  const icons = { 1: Crown, 2: Medal, 3: Award };
  const Icon = icons[rank];
  const colors = {
    1: 'gradient-blue text-white',
    2: 'bg-card border border-border',
    3: 'bg-card border border-border',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`rounded-2xl p-3 flex flex-col items-center justify-end text-center ${height} ${colors[rank]}`}
    >
      <Icon className={`w-6 h-6 mb-2 ${rank === 1 ? 'text-yellow-300' : 'text-primary'}`} />
      <p className="text-xs font-semibold truncate w-full">
        {user.username || user.full_name?.split(' ')[0] || 'Player'}
      </p>
      {user.streak_title && (
        <p className="text-[8px] opacity-80">{user.streak_title}</p>
      )}
      <p className={`text-lg font-display font-bold ${rank === 1 ? 'text-white' : 'text-foreground'}`}>
        {user.total_points || 0}
      </p>
    </motion.div>
  );
}

function RankRow({ user, rank, isMe }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border ${
        isMe ? 'bg-accent border-primary/30' : 'bg-card border-border'
      }`}
    >
      <span className="w-8 text-center font-bold text-muted-foreground text-sm">#{rank}</span>
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-foreground">
        {(user.username || user.full_name || '?')[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.username || user.full_name || 'Player'}</p>
        {user.streak_title && (
          <p className="text-[10px] text-primary font-semibold">{user.streak_title}</p>
        )}
      </div>
      <div className="flex items-center gap-1 text-primary font-bold">
        {user.total_points || 0}
        <Flame className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}
