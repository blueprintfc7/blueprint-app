import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Camera, LogOut, Instagram, Youtube,
  FileText, Shield, MessageSquare, ClipboardList, ChevronRight, Moon, Sun, Star, Bookmark, Share2, Trash2
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.24 8.24 0 0 0 4.82 1.54V6.78a4.85 4.85 0 0 1-1.05-.09z"/>
  </svg>
);
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PlanRequestDialog from '@/components/account/PlanRequestDialog';
import FeedbackDialog from '@/components/account/FeedbackDialog';
import InfoDialog from '@/components/account/InfoDialog';

export default function Account() {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [dark, setDark] = useState(() => {
    if (document.documentElement.classList.contains('dark')) return true;
    if (document.documentElement.classList.contains('light')) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [planOpen, setPlanOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(null); // 'privacy' | 'terms'

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setNewName(u.username || u.full_name || '');
    });
  }, []);

  const shareApp = () => {
    const shareData = {
      title: 'Blueprint FC',
      text: 'Train smarter with Blueprint — the football training app 🔥',
      url: window.location.origin,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleDark = () => {
    const html = document.documentElement;
    if (dark) {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
    setDark(!dark);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_picture_url: file_url });
    const updated = await base44.auth.me();
    setUser(updated);
    toast.success('Profile picture updated');
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    await base44.auth.updateMe({ username: newName.trim() });
    const updated = await base44.auth.me();
    setUser(updated);
    setEditingName(false);
    toast.success('Username updated');
  };

  if (!user) return null;

  return (
    <div className="px-5 pt-8 pb-6 space-y-6">
      <h1 className="text-4xl font-bold font-display tracking-tight">Account</h1>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
              {user.profile_picture_url ? (
                <img src={user.profile_picture_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-9" />
                <Button size="sm" onClick={saveName}>Save</Button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setEditingName(true)}
                  className="font-display text-xl font-bold text-left hover:text-primary"
                >
                  {user.username || user.full_name || 'Player'}
                </button>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Points</p>
            <p className="font-display text-xl font-bold">{user.total_points || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="font-display text-xl font-bold">{user.streak_days || 0} days</p>
          </div>
        </div>
      </motion.div>

      {/* Admin */}
      {user.email === 'blueprintfc7@gmail.com' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Link to="/plan-requests">
            <Row icon={ClipboardList} label="Manage plan requests" />
          </Link>
        </div>
      )}

      {/* Premium */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Link to="/premium">
          <Row
            icon={Star}
            label={user.is_premium ? '👑 Blueprint Premium (Active)' : '⚡ Upgrade to Premium'}
          />
        </Link>
      </div>

      {/* Saved Drills */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Link to="/saved-drills">
          <Row icon={Bookmark} label="Saved drills" />
        </Link>
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Row icon={ClipboardList} label="Request a training plan" onClick={() => setPlanOpen(true)} />
        <Row icon={MessageSquare} label="Send feedback" onClick={() => setFeedbackOpen(true)} />
        <Row icon={Share2} label="Share Blueprint with a friend" onClick={shareApp} showChevron={false} />
        <Row
          icon={dark ? Sun : Moon}
          label={dark ? 'Light mode' : 'Dark mode'}
          onClick={toggleDark}
          showChevron={false}
        />
      </div>

      {/* Social */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
          Join the community
        </h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <SocialRow icon={TikTokIcon} label="TikTok" href="https://www.tiktok.com/@blueprint.fc" />
          <SocialRow icon={Instagram} label="Instagram" href="https://www.instagram.com/blueprint.fc_?igsh=MWZzdHJ1eGltcjZ4bg%3D%3D&utm_source=qr" />
          <SocialRow icon={Youtube} label="YouTube" href="https://youtube.com/@blueprintt_fc?si=eEpohP3rR5XbgA_e" />
        </div>
      </div>

      {/* Legal */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
          Legal
        </h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Row icon={Shield} label="Privacy policy" onClick={() => setInfoOpen('privacy')} />
          <Row icon={FileText} label="Terms of service" onClick={() => setInfoOpen('terms')} />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Log out
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-12 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your data — sessions, points, and streak. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await base44.integrations.Core.SendEmail({
                  to: 'blueprintfc7@gmail.com',
                  subject: `Account deletion request: ${user.email}`,
                  body: `User ${user.full_name || user.email} has requested account deletion.`,
                });
                toast.success('Deletion request sent. We\'ll remove your account within 24h.');
                base44.auth.logout();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-center text-xs text-muted-foreground pt-2">Blueprint · v1.0</p>

      <PlanRequestDialog open={planOpen} onOpenChange={setPlanOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <InfoDialog type={infoOpen} onClose={() => setInfoOpen(null)} />
    </div>
  );
}

function Row({ icon: Icon, label, onClick, showChevron = true }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {showChevron && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

function SocialRow({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </a>
  );
}
