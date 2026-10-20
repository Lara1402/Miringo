import React from 'react';
import { motion } from 'motion/react';
import { Star, Shield, Award, User } from 'lucide-react';

export interface MugshotCardProps {
  level: number;
  title: string;
  currentXp: number;
  streakDays: number;
  streakFreezes: number;
  maxFreezes?: number;
  leagueRank: number;
  campus?: string;
  section?: string;
  avatarUrl?: string;
  className?: string;
}

export const MugshotCard: React.FC<MugshotCardProps> = ({
  level,
  title,
  currentXp,
  streakDays,
  streakFreezes,
  maxFreezes = 2,
  leagueRank,
  campus = 'GHAZIABAD',
  section = 'CSE DEPT',
  avatarUrl,
  className = '',
}) => {
  // Next Level formula: NextXP = 100 * (level + 1)^1.5
  const nextLevelXp = Math.round(100 * Math.pow(level + 1, 1.5));
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / nextLevelXp) * 100)));

  // Calculate stars
  const calculateStars = (days: number): number => {
    if (days <= 0) return 0;
    if (days === 1) return 1;
    if (days === 2) return 2;
    if (days >= 3 && days < 5) return 3;
    if (days >= 5 && days < 7) return 4;
    return 5;
  };

  const stars = calculateStars(streakDays);
  const isFiveStar = stars >= 5;

  return (
    <div
      className={`bg-[#121418] border border-zinc-800 p-6 rounded-xl relative overflow-hidden shadow-2xl select-none ${className}`}
    >
      {/* Visual Police Lineup Grid Texture / Height Chart Backdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute inset-y-0 right-3 w-8 flex flex-col justify-between py-6 pointer-events-none opacity-20 font-mono text-[9px] text-white">
        <span>6'2" —</span>
        <span>6'0" —</span>
        <span>5'10" —</span>
        <span>5'8" —</span>
        <span>5'6" —</span>
        <span>5'4" —</span>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 font-mono text-xs">
        <span className="uppercase tracking-widest text-zinc-400 font-bold">OPERATIVE DOSSIER</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          ACTIVE REPUTATION
        </span>
      </div>

      {/* Mugshot Frame with Angle Overlay */}
      <div className="relative w-28 h-28 mx-auto rounded-xl bg-zinc-950 border-2 border-zinc-700 overflow-hidden flex items-center justify-center shadow-inner group">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Operative Mugshot" className="w-full h-full object-cover grayscale contrast-125" />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600">
            <User className="w-14 h-14" />
          </div>
        )}
        {/* Angled Police Overlay Badge */}
        <div className="absolute bottom-1 inset-x-1 bg-black/85 border border-zinc-700 py-0.5 text-center">
          <p className="text-[8px] font-mono font-bold text-amber-400 tracking-wider truncate uppercase">
            {campus} // {section}
          </p>
        </div>
      </div>

      {/* Level & Title Progression */}
      <div className="text-center py-4">
        <div className="font-pricedown text-5xl sm:text-6xl text-white gta-text-shadow tracking-tight">
          LVL {level}
        </div>
        <p className="font-chalet text-sm uppercase tracking-widest text-amber-500 font-black mt-1">
          {title}
        </p>

        {/* 5-Star Wanted Meter */}
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {[1, 2, 3, 4, 5].map((index) => {
            const isActive = index <= stars;
            return (
              <motion.div
                key={index}
                animate={
                  isFiveStar && isActive
                    ? {
                        scale: [1, 1.25, 1],
                        filter: [
                          'drop-shadow(0 0 2px #FBBF24)',
                          'drop-shadow(0 0 10px #F59E0B)',
                          'drop-shadow(0 0 2px #FBBF24)',
                        ],
                      }
                    : {}
                }
                transition={{ repeat: Infinity, duration: 1.0, delay: index * 0.1 }}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? isFiveStar
                        ? 'text-[#FBBF24] fill-[#FBBF24] animate-gta-star'
                        : 'text-[#FBBF24] fill-[#FBBF24]'
                      : 'text-zinc-700 fill-zinc-800/40'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-300 font-bold mt-2">
          {stars}-STAR WANTED SPREE ({streakDays}-DAY STREAK)
        </p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">
          FAILOVER REDUNDANCY: {streakFreezes}/{maxFreezes} FREEZES LOADED
        </p>
      </div>

      {/* XP Gauge (Neon Green Health Bar) */}
      <div className="mt-3 space-y-1.5 font-mono">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400 font-bold">RESPECT GAUGED (XP)</span>
          <span className="text-emerald-400 font-bold">
            ${currentXp.toLocaleString()} / ${nextLevelXp.toLocaleString()} ({xpPercent}%)
          </span>
        </div>
        <div className="w-full bg-zinc-950 border border-zinc-800 h-3.5 p-0.5 rounded-sm overflow-hidden">
          <motion.div
            className="bg-emerald-500 h-full shadow-[0_0_12px_rgba(34,197,94,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Redundancy / Armor Stats with Physical Armor Plate Indicators */}
      <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-3 text-center">
        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" /> SYNDICATE
          </div>
          <div className="text-base font-black font-mono text-zinc-200 mt-1">RANK #{leagueRank}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase mt-1">CAMPUS LEAGUE</div>
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" /> ARMOR PLATES
          </div>
          {/* Dual Ballistic Armor Plate Indicators */}
          <div className="flex justify-center items-center gap-1.5 my-1.5">
            {[1, 2].map((plateIndex) => (
              <div
                key={plateIndex}
                className={`h-3.5 flex-1 max-w-[42px] rounded-xs border transition-all ${
                  streakFreezes >= plateIndex
                    ? 'bg-[#3B82F6] border-blue-400 shadow-[0_0_8px_#3B82F6]'
                    : 'bg-zinc-900 border-zinc-800 opacity-60'
                }`}
                title={`Armor Plate ${plateIndex}: ${
                  streakFreezes >= plateIndex ? 'LOADED (Active Freeze)' : 'DEPLETED'
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] font-black font-mono text-blue-400">
            {streakFreezes} / {maxFreezes} SLOTS READY
          </div>
        </div>
      </div>
    </div>
  );
};
