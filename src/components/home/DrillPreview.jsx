import React, { useState } from 'react';
import DrillVideo from '@/components/drills/DrillVideo';
import { motion } from 'framer-motion';
import { Clock, Zap, Target } from 'lucide-react';

const categoryColors = {
  dribbling: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  passing: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  shooting: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  fitness: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  defending: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  first_touch: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  agility: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
};

export default function DrillPreview({ drill, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div
        className="p-4 flex items-center gap-4"
        onClick={() => drill.video_url && setExpanded((v) => !v)}
      >
        <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{drill.name}</h4>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${categoryColors[drill.category] || 'bg-muted'}`}>
              {drill.category?.replace('_', ' ')}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {drill.duration_minutes}m
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" /> {drill.points} pts
            </span>
            {drill.video_url && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-primary/10 text-primary">
                {expanded ? 'Hide video' : '▶ Watch'}
              </span>
            )}
          </div>
        </div>
      </div>
      {expanded && drill.video_url && (
        <div className="px-4 pb-4">
          <DrillVideo url={drill.video_url} />
        </div>
      )}
    </motion.div>
  );
}
