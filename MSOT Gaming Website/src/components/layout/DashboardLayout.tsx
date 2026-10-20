import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProgression } from '../../services/progressionService';
import { Button } from '../ui/Button';
import { StatusHeader } from '../hud/StatusHeader';
import { MinimapHud } from '../hud/MinimapHud';
import { GtaSyllabusMap } from '../map/GtaSyllabusMap';
import { introAudio } from '../../utils/introAudio';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showReplayIntro?: boolean;
  onReplayIntro?: () => void;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const { progression } = useProgression();
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Press 'M' key to open/close GTA City Map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        introAudio.playWeaponWheelTick();
        setIsMapOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen text-slate-100" style={{ background: 'radial-gradient(ellipse at top, #141210 0%, #0a0a08 60%, #080808 100%)' }}>
      {/* GTA V LOS SANTOS HEADER */}
      <header className="border-b border-zinc-800 bg-[#0E1012]/95 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo with GTA V aesthetic */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="font-pricedown text-3xl md:text-4xl text-white gta-text-shadow tracking-tight">
                  MSOT <span className="text-[#F7941D]">V</span>
                </span>
                <span className="text-[10px] font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hidden sm:inline-block">
                  LOS SANTOS EDITION
                </span>
              </Link>
            </div>

            {/* Header Controls & GTA HUD Items */}
            <div className="flex items-center gap-3">
              {/* GTA V Status Header: Dynamic Cash Display, Wanted Level, Weapon Wheel [TAB] */}
              <StatusHeader
                xpAmount={progression.currentXp}
                streakDays={progression.streakDays}
                freezesRemaining={progression.streakFreezes}
                maxFreezes={progression.maxFreezes}
                onOpenMap={() => setIsMapOpen(true)}
                onStartQuiz={() => navigate('/quest/node-2')}
              />

              {/* City Map Trigger Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  introAudio.playWeaponWheelTick();
                  setIsMapOpen(true);
                }}
                className="hidden md:inline-flex border-amber-500/30 hover:border-amber-400 text-amber-300 font-mono text-xs uppercase"
                icon={<MapIcon className="w-3.5 h-3.5 text-amber-400" />}
              >
                City Map [M]
              </Button>

              {/* Admin Approvals Link */}
              {profile?.role === 'admin' && (
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-colors uppercase"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  Admin
                </Link>
              )}

              {profile && (
                <Link
                  to="/student"
                  className="text-xs font-mono text-zinc-400 hover:text-amber-400 transition hidden sm:block font-bold uppercase tracking-wider"
                  title="Open Operative Dossier"
                >
                  {profile.full_name}
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                icon={<LogOut className="w-3.5 h-3.5" />}
                className="font-mono text-xs uppercase text-zinc-400 hover:text-red-400"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="font-pricedown text-4xl md:text-5xl font-black text-white uppercase tracking-tight gta-text-shadow">
              {title}
            </h1>
            {subtitle && <p className="text-zinc-500 text-xs mt-1.5 font-mono uppercase tracking-widest">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </main>

      {/* PERSISTENT GTA V MINIMAP RADAR HUD (LOWER LEFT CORNER) */}
      <MinimapHud
        quizCompleted={progression.completedNodeIds.length > 0}
        freezesRemaining={progression.streakFreezes}
        maxFreezes={progression.maxFreezes}
        campusName="MSOT Ghaziabad Core"
        activeQuestTitle={progression.completedNodeIds.length > 0 ? 'Safehouse Alpha Cleared' : 'Safehouse Alpha: Intro to Big-O'}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* FULLSCREEN GTA V PAUSE SCREEN / CITY SYLLABUS MAP */}
      <GtaSyllabusMap
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        completedNodeIds={progression.completedNodeIds}
        onStartQuest={(node) => {
          setIsMapOpen(false);
          navigate(`/quest/${node.id}`);
        }}
      />
    </div>
  );
}
