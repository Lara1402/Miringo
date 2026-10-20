import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';

interface GtaMissionPassedProps {
  show: boolean;
  title?: string;
  xpAwarded?: number;
  streakText?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const GtaMissionPassed: React.FC<GtaMissionPassedProps> = ({
  show,
  title = 'MISSION PASSED!',
  xpAwarded = 15,
  streakText = 'STREAK MAINTAINED',
  onDismiss,
  autoDismissMs = 3500,
}) => {
  useEffect(() => {
    if (show) {
      introAudio.playMissionPassed();
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [show, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 2.5, rotate: -6, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-full max-w-xl text-center p-8 md:p-12 rounded-3xl bg-black border-4 border-[#FBBF24] shadow-[0_0_90px_rgba(251,191,36,0.65)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Ray Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.15)_0%,_transparent_75%)] pointer-events-none" />

            {/* Mission Passed Header */}
            <h1 className="font-pricedown text-6xl md:text-8xl text-[#FBBF24] gta-text-shadow tracking-tight">
              {title}
            </h1>

            {/* Gold Divider Line */}
            <div className="w-3/4 h-1 bg-[#FBBF24] mx-auto my-5 shadow-[0_0_10px_#FBBF24]" />

            {/* Respect XP & Streak */}
            <div className="space-y-3 font-chalet">
              <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider gta-text-shadow">
                +{xpAwarded} RESPECT <span className="text-emerald-400 font-mono">(XP)</span>
              </p>

              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-sm md:text-base tracking-widest shadow-md">
                <Shield className="w-4 h-4" /> {streakText}
              </div>
            </div>

            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-8 font-bold">
              TAP ANYWHERE TO CONTINUE [SPACE]
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
