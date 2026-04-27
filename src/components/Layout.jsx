import React, { useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/blueprint', icon: Calendar, label: 'Blueprint' },
  { to: '/start', icon: Plus, label: 'Start', center: true },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/account', icon: User, label: 'Account' },
];

export default function Layout() {
  const location = useLocation();
  const scrollPositions = useRef({});
  const mainRef = useRef(null);

  // Save scroll position when leaving a route
  useEffect(() => {
    const el = mainRef.current;
    return () => {
      if (el) scrollPositions.current[location.pathname] = el.scrollTop;
    };
  }, [location.pathname]);

  // Restore scroll position when entering a route
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const saved = scrollPositions.current[location.pathname] || 0;
    requestAnimationFrame(() => { el.scrollTop = saved; });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main ref={mainRef} className="flex-1 pb-24 max-w-3xl w-full mx-auto overflow-y-auto overflow-x-hidden h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 select-none">
        <div className="max-w-3xl mx-auto px-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <div className="glass bg-card/80 border border-border rounded-2xl shadow-lg shadow-primary/5 px-2 py-2 flex items-center justify-around">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              if (item.center) {
                return (
                  <NavLink key={item.to} to={item.to} className="relative -mt-8">
                    <motion.div
                      whileTap={{ scale: 0.92 }}
                      className="w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center shadow-lg shadow-primary/40"
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </NavLink>
                );
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors min-h-[44px] min-w-[44px] justify-center"
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
