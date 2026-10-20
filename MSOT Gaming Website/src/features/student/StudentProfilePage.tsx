import React, { useState } from 'react';
import { Swords, Map, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { OperativeHeader } from '../../components/student/OperativeHeader';
import { MugshotCard } from '../../components/student/MugshotCard';
import { BadgesGrid } from '../../components/student/BadgesGrid';
import { XpTransactionLedger } from '../../components/student/XpTransactionLedger';
import { useAuth } from '../../hooks/useAuth';
import { useProgression } from '../../services/progressionService';
import { introAudio } from '../../utils/introAudio';

export const StudentProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { progression } = useProgression();

  // Anonymous mode state stored locally for seamless toggle
  const [anonymousMode, setAnonymousMode] = useState<boolean>(() => {
    return localStorage.getItem('msot_anonymous_mode') === 'true';
  });

  const handleToggleAnonymous = () => {
    setAnonymousMode((prev) => {
      const next = !prev;
      localStorage.setItem('msot_anonymous_mode', next ? 'true' : 'false');
      return next;
    });
  };

  // Profile data with fallbacks
  const realName = profile?.full_name || 'Sudhanshu Gupta';
  const idHex = (profile?.id || '7f9a2b').replace(/-/g, '').slice(-4).toUpperCase();
  const maskedName = `OPERATIVE #${idHex}`;

  const isSafehouseCleared = progression.completedNodeIds.includes('node-1');
  const isRecursionCleared = progression.completedNodeIds.includes('node-2');
  const isLeetcodeCleared = progression.completedNodeIds.includes('node-leetcode');

  return (
    <DashboardLayout
      title="OPERATIVE DOSSIER"
      subtitle="Los Santos Academic Command // Student Records Terminal"
    >
      <div className="space-y-6">
        {/* 1. HEADER HUD BAR & ANONYMOUS TOGGLE */}
        <OperativeHeader
          realName={realName}
          maskedName={maskedName}
          campus="Ghaziabad"
          section="CSE-A"
          title={progression.levelTitle}
          league={progression.leagueName}
          anonymousMode={anonymousMode}
          onToggleAnonymous={handleToggleAnonymous}
        />

        {/* 2. THREE-COLUMN DOSSIER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: CHARACTER DOSSIER, MUGSHOT & WANTED METER (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <MugshotCard
              level={progression.level}
              title={progression.levelTitle}
              currentXp={progression.currentXp}
              streakDays={progression.streakDays}
              streakFreezes={progression.streakFreezes}
              maxFreezes={progression.maxFreezes}
              leagueRank={progression.leagueRank}
              campus="GHAZIABAD"
              section="CSE DEPT"
            />

            {/* Active Weekly Heists / Micro-Challenge Status Card */}
            <div className="bg-[#121418] border border-zinc-800 p-6 rounded-xl shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-[#F7941D]" /> ACTIVE HEIST OBJECTIVE
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isRecursionCleared
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {isRecursionCleared ? 'HEIST COMPLETED' : 'IN PROGRESS'}
                </span>
              </div>

              <div className="space-y-3 font-sans">
                <h4 className="font-chalet text-lg font-black text-white uppercase tracking-tight">
                  OPERATION: RECURSION INVERSION
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Solve algorithm questions and code challenges to preserve Wanted streak and unlock the{' '}
                  <span className="text-amber-400 font-bold">+50 XP Streak Multiplier</span>.
                </p>

                <div className="pt-2">
                  <div className="flex justify-between font-mono text-[11px] text-zinc-400 mb-1">
                    <span>PROGRESS: {isRecursionCleared ? '5/5 QUESTIONS' : (isSafehouseCleared ? '2/5 QUESTIONS' : '0/5 QUESTIONS')}</span>
                    <span className="text-emerald-400 font-bold">
                      {isRecursionCleared ? '100%' : (isSafehouseCleared ? '40%' : '0%')}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: isRecursionCleared ? '100%' : (isSafehouseCleared ? '40%' : '0%') }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT / MAIN CONTENT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* MINI GPS ROAD-MAP PREVIEW CARD */}
            <div className="bg-[#121418] border border-zinc-800 p-5 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-bold flex items-center gap-2">
                    <Map className="w-4 h-4 text-cyan-400" />
                    SYLLABUS SECTOR RADAR // LOS SANTOS GPS
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase mt-0.5">
                    {progression.completedNodeIds.length} SECTORS CLEARED • {Math.max(0, 5 - progression.completedNodeIds.length)} REMAINING
                  </p>
                </div>

                <button
                  onClick={() => {
                    introAudio.playWeaponWheelTick();
                    navigate('/syllabus');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F7941D] hover:bg-amber-400 text-black font-mono text-xs uppercase font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                >
                  Launch Full GPS [M] <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Topographic Mini Route View */}
              <div className="relative h-24 rounded-lg bg-[#090d16] border border-zinc-800/80 p-3 overflow-hidden flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2 z-10">
                  {isSafehouseCleared ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  <div>
                    <span className="text-zinc-200 font-bold uppercase block">Safehouse Alpha</span>
                    <span className="text-[9px] text-zinc-500 uppercase">
                      {isSafehouseCleared ? 'Big-O Complexity • Passed' : 'Active Starting Sector'}
                    </span>
                  </div>
                </div>

                <div className={`h-0.5 flex-1 mx-3 z-10 border-dashed ${
                  isSafehouseCleared ? 'bg-emerald-500' : 'bg-zinc-700'
                }`} />

                <div className="flex items-center gap-2 z-10">
                  {isRecursionCleared ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
                  )}
                  <div>
                    <span className="text-amber-400 font-bold uppercase block">Recursion Armory</span>
                    <span className="text-[9px] text-zinc-400 uppercase">
                      {isRecursionCleared ? 'Cleared' : 'Algorithmic gauntlet'}
                    </span>
                  </div>
                </div>

                <div className={`h-0.5 flex-1 mx-3 z-10 ${
                  isLeetcodeCleared ? 'bg-emerald-500' : 'bg-zinc-800'
                }`} />

                <div className="flex items-center gap-2 z-10 opacity-60">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <div>
                    <span className="text-zinc-400 font-bold uppercase block">Exam Fortress</span>
                    <span className="text-[9px] text-zinc-600 uppercase">Locked • Fog of War</span>
                  </div>
                </div>

                {/* Subtle background satellite grid */}
                <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,40 Q150,10 300,50 T600,30" fill="none" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M0,80 Q200,60 400,90 T800,70" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* THE ARMORY: REPUTATION MEDALLIONS */}
            <BadgesGrid unlockedSlugs={progression.unlockedBadgeSlugs} />

            {/* THE HEIST LEDGER: IMMUTABLE XP TRANSACTION HISTORY */}
            <XpTransactionLedger history={progression.transactions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
