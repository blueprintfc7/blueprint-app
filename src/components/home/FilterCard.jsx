import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * FilterCard supports two modes:
 *  - single (default): value is a scalar, onChange(scalar)
 *  - multi:            value is an array, onChange(array)
 */
export default function FilterCard({ icon: Icon, label, options, value, onChange, multi = false }) {
  const handleClick = (optValue) => {
    if (!multi) {
      onChange(optValue);
      return;
    }
    const current = Array.isArray(value) ? value : [];
    if (current.includes(optValue)) {
      onChange(current.filter((v) => v !== optValue));
    } else {
      onChange([...current, optValue]);
    }
  };

  const isActive = (optValue) => {
    if (multi) return Array.isArray(value) && value.includes(optValue);
    return value === optValue;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {multi && (
          <span className="text-[10px] text-muted-foreground ml-1">(select all that apply)</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = isActive(opt.value);
          return (
            <motion.button
              key={String(opt.value)}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {active && <Check className="w-3.5 h-3.5" />}
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
