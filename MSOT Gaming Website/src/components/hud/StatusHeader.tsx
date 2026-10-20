import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Disc3 } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';
import { WeaponWheel } from './WeaponWheel';

export interface StatusHeaderProps {
  xpAmount?: number;
  streakDays?: number;
  freezesRemaining?: number;
  maxFreezes?: number;
  onOpenMap?: () => void;
  onStartQuiz?: () => void;
  className?: string;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  xpAmount = 4250,
  streakDays = 5,
  freezesRemaining = 2,
  maxFreezes = 2,
  onOpenMap,
  onStartQuiz,
  className = '',
}) => {
  const [displayXp, setDisplayXp] = useState(xpAmount);
  const [isWeaponWheelOpen, setIsWeaponWheelOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showWastedBanner, setShowWastedBanner] = useState(false);

  // Animated Cash Count-Up Ticker
  useEffect(() => {
    if (displayXp === xpAmount) return;
    const step = Math.ceil(Math.abs(xpAmount - displayXp) / 10);
    const interval = setInterval(() => {
      setDisplayXp((prev) => {
        if (prev < xpAmount) {
          return Math.min(prev + step, xpAmount);
        } else if (prev > xpAmount) {
          return Math.max(prev - step, xpAmount);
        }
        clearInterval(interval);
        return xpAmount;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [xpAmount, displayXp]);

  // Bind key 'Tab' to Weapon Wheel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        introAudio.playWeaponWheelTick();
        setIsWeaponWheelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format cash display e.g. $ 004,250
  const formattedCash = `$ ${displayXp.toLocaleString('en-US', { minimumIntegerDigits: 6 })}`;

  // Calculate Wanted Stars
  const calculateStars = (days: number): number => {
    if (days <= 0) return 0;
    if (days === 1) return 1;
    if (days === 2) return 2;
    if (days >= 3 && days < 5) return 3;
    if (days >= 5 && days < 7) return 4;
    return 5; // 7+ days
  };

  const stars = calculateStars(streakDays);
  const isFiveStar = stars >= 5;

  const handleClaimStreak = () => {
    if (isFiveStar) {
      introAudio.playWantedPing();
    } else {
      introAudio.playWeaponWheelTick();
    }
  };

  const triggerWasted = () => {
    introAudio.playWasted();
    setShowWastedBanner(true);
  };

  return (
    <>
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        {/* 1. CASH DISPLAY (CURRENT XP) */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/90 border border-zinc-800 shadow-md font-mono cursor-default"
          title={`Total Respect: ${displayXp} XP`}
        >
          <span className="text-[10px] font-black text-zinc-500 uppercase">XP</span>
          <span
            className="text-xs sm:text-sm font-black text-[#22C55E] tracking-wider"
            style={{ textShadow: '0 0 8px rgba(34, 197, 94, 0.65)' }}
          >
            {formattedCash}
          </span>
        </div>

        {/* 2. WANTED LEVEL (LEARNING STREAK) */}
        <div className="relative inline-flex items-center">
          <div
            className="flex items-center gap-1 bg-black/90 px-2.5 py-1.5 rounded-lg border border-zinc-800 shadow-md cursor-pointer hover:border-amber-500/50 transition-all"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => {
              handleClaimStreak();
              setShowTooltip(!showTooltip);
            }}
          >
            <span className="text-[9px] font-mono font-black text-zinc-400 mr-0.5 uppercase hidden sm:inline">
              WANTED
            </span>
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
                  transition={{ repeat: Infinity, duration: 0.9, delay: index * 0.1 }}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
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
            {streakDays > 0 && (
              <span className="ml-1 text-[11px] font-mono font-black text-amber-400">
                {streakDays}D
              </span>
            )}
          </div>

          {/* Wanted Level Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full right-0 mt-2 z-50 w-64 p-3 rounded-xl bg-black/95 border border-amber-500/40 text-xs text-white shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 font-mono">
                  <span className="font-black text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    STREAK WANTED LEVEL
                  </span>
                  <span className="text-zinc-400 font-bold">{stars} / 5 STARS</span>
                </div>

                <div className="space-y-1.5 py-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Current Streak:</span>
                    <span className="text-white font-bold">{streakDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Streak Armor (Freezes):</span>
                    <span className="text-blue-400 font-bold">
                      {freezesRemaining}/{maxFreezes} Left
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Multiplier Status:</span>
                    <span className={isFiveStar ? 'text-amber-400 font-black' : 'text-zinc-300'}>
                      {isFiveStar ? 'MAX +50 XP MULTIPLIER' : 'Standard XP'}
                    </span>
                  </div>
                </div>

                {isFiveStar && (
                  <div className="mt-1 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300 font-mono">
                    ★ 5-STAR WANTED: Daily streak exceeds 7 days. Auditory siren active on claim.
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerWasted();
                    }}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    [Test Busted Alert]
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. WEAPON WHEEL SHORTCUT / QUICK SWITCH */}
        <button
          onClick={() => {
            introAudio.playWeaponWheelTick();
            setIsWeaponWheelOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white font-mono text-xs uppercase font-bold tracking-wider transition cursor-pointer shadow-md"
          title="Open GTA V Weapon Wheel [TAB]"
        >
          <Disc3 className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="hidden sm:inline">Wheel</span>
          <span className="text-[10px] text-zinc-500 font-bold">[TAB]</span>
        </button>
      </div>

      {/* WEAPON WHEEL MODAL */}
      <WeaponWheel
        isOpen={isWeaponWheelOpen}
        onClose={() => setIsWeaponWheelOpen(false)}
        onOpenMap={onOpenMap}
        onStartQuiz={onStartQuiz}
      />

      {/* WASTED / BUSTED BANNER MODAL */}
      <AnimatePresence>
        {showWastedBanner && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center p-8 border-y-4 border-red-600 bg-black/90 w-full shadow-[0_0_100px_rgba(220,38,38,0.7)]">
              <h1 className="font-pricedown text-8xl text-red-600 gta-text-shadow tracking-widest animate-pulse">
                BUSTED
              </h1>
              <p className="font-chalet text-xl text-zinc-300 uppercase tracking-widest mt-2">
                Streak Frozen • Attendance / Quests Dropped
              </p>
              <button
                onClick={() => setShowWastedBanner(false)}
                className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase rounded tracking-widest cursor-pointer"
              >
                Respawn at Lab [Close]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
