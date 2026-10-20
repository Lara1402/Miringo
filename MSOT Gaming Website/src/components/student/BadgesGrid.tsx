import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Crosshair, ShieldCheck, Zap, X, CheckCircle2, Lock } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';
import type { BadgeItem } from '../../types/student';

const DEFAULT_BADGES: BadgeItem[] = [
  {
    id: 'b1',
    slug: 'recursion-kingpin',
    name: 'Recursion Kingpin',
    category: 'TOPIC_QUEST',
    tier: 'GOLD',
    description: 'Mastered tree recursion, depth-first search, and backtracking algorithms with zero stack overflows.',
    criteria: 'Solve 10 recursive algorithms under 100ms runtime with clean call stack verification.',
    unlockedAt: '12-10-2026 // 21:40:12 IST',
    isUnlocked: false,
    verificationSource: 'GH-RUNNER-9082 // AUTOGRADE-PASSED',
  },
  {
    id: 'b2',
    slug: 'memory-allocator',
    name: 'Memory Allocator',
    category: 'TOPIC_QUEST',
    tier: 'SILVER',
    description: 'Zero memory leaks detected across dynamic heap allocation test suites.',
    criteria: 'Pass Valgrind memory leak inspection on C/C++ pointer assignment with 0 byte leaks.',
    unlockedAt: '14-10-2026 // 18:22:05 IST',
    isUnlocked: false,
    verificationSource: 'VALGRIND-0-LEAK-VERIFIED',
  },
  {
    id: 'b3',
    slug: 'sql-heist-master',
    name: 'SQL Heist Master',
    category: 'TOPIC_QUEST',
    tier: 'GOLD',
    description: 'Cracked relational schemas, resolved infinite recursion RLS policies, and wrote sub-millisecond queries.',
    criteria: 'Author hardened database security rules and recursive CTE queries with clean explain plans.',
    unlockedAt: '16-10-2026 // 02:15:33 IST',
    isUnlocked: false,
    verificationSource: 'SUPABASE-RLS-POLICIES-FIXED',
  },
  {
    id: 'b4',
    slug: 'century-club',
    name: 'Century Club',
    category: 'MILESTONE',
    tier: 'GOLD',
    description: 'Maintained 100 days of active campus engagement and problem solving without streak breakage.',
    criteria: 'Log in and complete at least 1 academic quest or review daily for 100 consecutive days.',
    unlockedAt: '10-10-2026 // 00:01:00 IST',
    isUnlocked: false,
    verificationSource: 'MSOT-STREAK-LEDGER-HASH-100D',
  },
  {
    id: 'b5',
    slug: 'bug-hunter',
    name: 'Bug Hunter',
    category: 'MILESTONE',
    tier: 'SILVER',
    description: 'Zero drops across 25 consecutive daily micro-quizzes with perfect accuracy.',
    criteria: 'Answer 100% of micro-challenge questions correctly over 25 continuous challenge days.',
    unlockedAt: '17-10-2026 // 19:10:48 IST',
    isUnlocked: false,
    verificationSource: 'QUIZ-AUDIT-25-CLEAN-RUN',
  },
  {
    id: 'b6',
    slug: 'comeback-kid',
    name: 'Comeback Kid',
    category: 'IMPROVEMENT',
    tier: 'GOLD',
    description: 'Demonstrated massive academic growth by boosting bi-weekly test performance by +15%.',
    criteria: 'Score 15%+ higher on the second bi-weekly examination trial compared to initial diagnostic.',
    unlockedAt: '15-10-2026 // 16:30:20 IST',
    isUnlocked: false,
    verificationSource: 'FACULTY-AUDIT-VERIFIED-GROWTH',
  },
  {
    id: 'b7',
    slug: 'night-grinder',
    name: 'Night Grinder',
    category: 'IMPROVEMENT',
    tier: 'SILVER',
    description: 'Completed comprehensive algorithmic practice gauntlets before midnight deadlines.',
    criteria: 'Submit verified code passing all test cases between 22:00 and 23:59 IST.',
    unlockedAt: '17-10-2026 // 23:45:10 IST',
    isUnlocked: false,
    verificationSource: 'MIDNIGHT-COMMIT-VERIFICATION',
  },
  {
    id: 'b8',
    slug: 'resilience-operative',
    name: 'Resilience Operative',
    category: 'IMPROVEMENT',
    tier: 'BRONZE',
    description: 'Turned a contested assessment around by passing 3 subsequent peer reviews and lab submissions.',
    criteria: 'Earn 3 consecutive verified marks following a flagged or contested submission.',
    isUnlocked: false,
  },
];

export interface BadgesGridProps {
  badges?: BadgeItem[];
  unlockedSlugs?: string[];
  className?: string;
}

export const BadgesGrid: React.FC<BadgesGridProps> = ({
  badges = DEFAULT_BADGES,
  unlockedSlugs,
  className = '',
}) => {
  const [inspectedBadge, setInspectedBadge] = useState<BadgeItem | null>(null);

  const effectiveBadges = React.useMemo(() => {
    return badges.map((badge) => {
      const isUnlocked = unlockedSlugs !== undefined ? unlockedSlugs.includes(badge.slug) : badge.isUnlocked;
      return {
        ...badge,
        isUnlocked,
      };
    });
  }, [badges, unlockedSlugs]);

  const handleInspect = (badge: BadgeItem) => {
    introAudio.playWeaponWheelTick();
    setInspectedBadge(badge);
  };

  const getTierStyles = (tier: 'BRONZE' | 'SILVER' | 'GOLD', isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        badge: 'bg-zinc-900/60 border-zinc-800 text-zinc-500',
        pill: 'bg-zinc-800 text-zinc-500 border-zinc-700',
      };
    }
    switch (tier) {
      case 'GOLD':
        return {
          badge: 'border-amber-400/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'SILVER':
        return {
          badge: 'border-zinc-400/40 text-zinc-200 shadow-[0_0_15px_rgba(212,212,216,0.1)]',
          pill: 'bg-zinc-400/10 text-zinc-300 border-zinc-500/30',
        };
      case 'BRONZE':
        return {
          badge: 'border-amber-700/40 text-amber-600',
          pill: 'bg-amber-900/20 text-amber-600 border-amber-700/30',
        };
    }
  };

  const getCategoryLabel = (category: 'TOPIC_QUEST' | 'MILESTONE' | 'IMPROVEMENT') => {
    switch (category) {
      case 'TOPIC_QUEST':
        return 'Topic Quest';
      case 'MILESTONE':
        return 'Milestone';
      case 'IMPROVEMENT':
        return 'Comeback (+15%)';
    }
  };

  const renderBadgeIcon = (badge: BadgeItem) => {
    if (!badge.isUnlocked) {
      return <Lock className="w-5 h-5 text-zinc-600" />;
    }
    if (badge.category === 'TOPIC_QUEST') {
      return <Crosshair className="w-5 h-5 text-amber-400" />;
    }
    if (badge.category === 'IMPROVEMENT') {
      return <Zap className="w-5 h-5 text-emerald-400" />;
    }
    return <ShieldCheck className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className={`bg-[#121418] border border-zinc-800 p-6 rounded-xl relative shadow-2xl select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-bold flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          THE ARMORY // REPUTATION MEDALLIONS ({effectiveBadges.filter((b) => b.isUnlocked).length}/{effectiveBadges.length} UNLOCKED)
        </h3>
        <span className="text-[10px] font-mono text-zinc-500 uppercase">
          HEIST PREP LOCKER
        </span>
      </div>

      {/* Grid of metallic heist medallions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {effectiveBadges.map((badge) => {
          const isSelected = inspectedBadge?.id === badge.id;
          const tierStyles = getTierStyles(badge.tier, badge.isUnlocked);

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleInspect(badge)}
              className={`p-3 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between items-center ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : badge.isUnlocked
                    ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-600'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`p-2 rounded-lg bg-zinc-900 border mb-2 ${tierStyles.badge}`}>
                {renderBadgeIcon(badge)}
              </div>

              <div className={`text-[11px] font-mono font-bold line-clamp-1 uppercase ${badge.isUnlocked ? 'text-zinc-200' : 'text-zinc-500'}`}>
                {badge.name}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${tierStyles.pill}`}>
                  {badge.tier}
                </span>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase line-clamp-1">
                  {getCategoryLabel(badge.category)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Inspector View */}
      <AnimatePresence>
        {inspectedBadge && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0E1012] border-2 border-amber-500/60 p-6 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] font-mono text-xs text-zinc-300 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${inspectedBadge.isUnlocked ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                    {renderBadgeIcon(inspectedBadge)}
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                      {getCategoryLabel(inspectedBadge.category)} // {inspectedBadge.tier} MEDALLION
                    </span>
                    <h2 className="text-xl font-black text-white uppercase font-chalet tracking-tight mt-0.5">
                      {inspectedBadge.name}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedBadge(null)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">MEDALLION BRIEFING:</span>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">{inspectedBadge.description}</p>
              </div>

              {/* Criteria */}
              {inspectedBadge.criteria && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCK CRITERIA:
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">{inspectedBadge.criteria}</p>
                </div>
              )}

              {/* Verification Telemetry */}
              <div className="space-y-1 text-[11px] pt-1 border-t border-zinc-800/80">
                <div className="flex justify-between text-zinc-400">
                  <span>STATUS:</span>
                  <span className={`font-bold ${inspectedBadge.isUnlocked ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {inspectedBadge.isUnlocked ? 'UNLOCKED & VERIFIED' : 'LOCKED // FOG OF WAR'}
                  </span>
                </div>
                {inspectedBadge.unlockedAt && (
                  <div className="flex justify-between text-zinc-400">
                    <span>TIMESTAMP:</span>
                    <span className="text-white font-bold">{inspectedBadge.unlockedAt}</span>
                  </div>
                )}
                {inspectedBadge.verificationSource && (
                  <div className="flex justify-between text-zinc-400">
                    <span>VERIFICATION HASH:</span>
                    <span className="text-emerald-400 font-bold truncate max-w-[200px]">
                      {inspectedBadge.verificationSource}
                    </span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setInspectedBadge(null)}
                className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 uppercase font-black tracking-widest text-xs transition cursor-pointer"
              >
                CLOSE DOSSIER [ESC]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
