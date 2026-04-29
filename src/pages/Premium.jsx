import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Trophy, ChevronLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PERKS = [
  { icon: '🔥', text: 'Streak system with Boot Tallies' },
  { icon: '🛡️', text: 'Streak Shield — restore a broken streak' },
  { icon: '🏅', text: 'Exclusive milestone badges (7, 14, 30, 60, 100 days)' },
  { icon: '🔓', text: 'Unlock hidden premium drills at milestones' },
  { icon: '👑', text: 'Leaderboard titles (Warrior, Elite, Legend, Icon)' },
  { icon: '⚡', text: 'Priority support & early access to new features' },
];

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$4.99',
    period: '/month',
    sub: 'Cancel anytime',
    highlight: false,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$50',
    period: '/year',
    sub: 'Save 17% vs monthly',
    highlight: true,
    badge: 'Best value',
  },
];

export default function Premium() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    // Simulate payment — in production, integrate Stripe here
    await new Promise((r) => setTimeout(r, 1200));
    await base44.auth.updateMe({ is_premium: true, premium_plan: selected });
    toast.success('Welcome to Blueprint Premium! 🎉');
    setLoading(false);
    navigate('/blueprint');
  };

  if (user?.is_premium) {
    return (
      <div className="px-5 pt-8 pb-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/account"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-3xl font-bold font-display">Premium</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 text-center space-y-3"
        >
          <img
            src="https://media.base44.com/images/public/69e541eea6ecd949e210e766/d58de2e1a_964E8EE0-EC92-4827-8CE8-96EC107500B9.jpg"
            alt="Blueprint Premium"
            className="w-32 h-32 object-contain mx-auto rounded-xl"
          />
          <h2 className="font-display text-2xl font-bold">You're Premium</h2>
          <p className="text-muted-foreground text-sm">
            Plan: {user.premium_plan === 'monthly' ? '$4.99/month' : '$50/year'}
          </p>
          <p className="text-sm text-muted-foreground">All features unlocked. Keep training!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/account"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold font-display">Blueprint Premium</h1>
          <p className="text-sm text-muted-foreground">Unlock your full potential</p>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-blue rounded-2xl p-6 text-white text-center space-y-3"
      >
        <img
          src="https://media.base44.com/images/public/69e541eea6ecd949e210e766/d58de2e1a_964E8EE0-EC92-4827-8CE8-96EC107500B9.jpg"
          alt="Blueprint Premium"
          className="w-36 h-36 object-contain mx-auto rounded-xl"
        />
        <h2 className="font-display text-2xl font-bold">Train Every Day.</h2>
        <p className="text-sm opacity-80">Build your streak. Earn your badges. Unlock your legend.</p>
      </motion.div>

      {/* Perks */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-semibold text-base">What's included</h3>
        {PERKS.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg">{p.icon}</span>
            <span className="text-sm">{p.text}</span>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {PLANS.map((plan) => (
          <motion.button
            key={plan.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(plan.id)}
            className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
              selected === plan.id
                ? 'border-primary bg-accent'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold">{plan.label}</span>
                  {plan.badge && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.sub}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full h-14 text-base rounded-2xl gradient-blue text-white shadow-lg shadow-primary/30"
      >
        {loading ? 'Processing...' : `Subscribe · ${selected === 'monthly' ? '$4.99/mo' : '$50/yr'}`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Payments are secure. Cancel anytime.
      </p>
    </div>
  );
}
