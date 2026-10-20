import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MapPin, Target, Navigation } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';

export interface MinimapHudProps {
  quizCompleted?: boolean;
  freezesRemaining?: number;
  maxFreezes?: number;
  campusName?: string;
  activeQuestTitle?: string;
  onOpenMap?: () => void;
  className?: string;
}

export const MinimapHud: React.FC<MinimapHudProps> = ({
  quizCompleted = true,
  freezesRemaining = 2,
  maxFreezes = 2,
  campusName = 'Ghaziabad Sector 4',
  activeQuestTitle = 'Recursion & Binary Trees',
  onOpenMap,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Health: 100% if quiz completed, 25% if pending
  const healthPercent = quizCompleted ? 100 : 25;

  const handleClickRadar = () => {
    introAudio.playWeaponWheelTick();
    if (onOpenMap) {
      onOpenMap();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 z-40 select-none ${className}`}>
      {/* Semi-Square GTA Radar Frame */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClickRadar}
        className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-[#0E1012]/95 border-2 border-zinc-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.9)] p-2 backdrop-blur-md cursor-pointer hover:border-amber-500/80 transition-all flex flex-col justify-between overflow-hidden"
      >
        {/* Radar Map Window: Rectangular viewport with dark satellite vector styling */}
        <div className="relative w-full h-[70%] rounded-xl bg-[#090d16] border border-zinc-800 overflow-hidden flex items-center justify-center">
          {/* Radar Circles and Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="minimapSweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="1" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#334155" strokeWidth="1" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="#1e293b" strokeWidth="1" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="#1e293b" strokeWidth="1" />

            {/* Sweep Arm */}
            <line
              x1="50"
              y1="50"
              x2="85"
              y2="25"
              stroke="#22c55e"
              strokeWidth="1.5"
              className="animate-spin"
              style={{ transformOrigin: '50% 50%', animationDuration: '4s' }}
            />

            {/* Road Contours & Highway Network */}
            <path d="M10 80 Q 40 40 90 30" fill="none" stroke="#475569" strokeWidth="2.5" />
            <path d="M20 10 Q 50 60 85 90" fill="none" stroke="#475569" strokeWidth="1.5" />
            <path d="M5 45 Q 45 48 95 55" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Active Quest Marker (Orange/Gold GTA Blip) */}
          <div className="absolute top-3 right-4 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F7941D] animate-ping absolute" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F7941D] border-2 border-white shadow-lg relative flex items-center justify-center">
              <span className="text-[7px] font-black text-black">Q</span>
            </div>
          </div>

          {/* Current Player Icon: Directional Arrow Icon in Center */}
          <div className="relative z-10 flex flex-col items-center">
            <Navigation className="w-5 h-5 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_#06b6d4] rotate-45 transform" />
          </div>

          {/* Radar Horizon Grid North Tag */}
          <div className="absolute top-1 left-2 text-[8px] font-mono font-black text-amber-400 uppercase tracking-wider">
            N • GPS
          </div>
        </div>

        {/* Dual Status Bars Under Radar */}
        <div className="w-full flex items-center gap-1.5 pt-1">
          {/* Left Bar (Green / Health): Daily Quest / Micro-Challenge Status */}
          <div className="flex-1 space-y-0.5">
            <div className="h-2 w-full bg-zinc-950 rounded-sm overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all duration-500 ${
                  quizCompleted ? 'bg-[#22C55E]' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${healthPercent}%` }}
                title={`Daily Quest Health: ${quizCompleted ? '100% Completed' : 'Pending'}`}
              />
            </div>
            <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-bold">
              <span className="text-zinc-500 uppercase">HP</span>
              <span className={quizCompleted ? 'text-emerald-400' : 'text-red-400'}>
                {quizCompleted ? '100%' : 'DUE'}
              </span>
            </div>
          </div>

          {/* Right Bar (Blue / Armor): Streak Freeze Reserves (2 segments) */}
          <div className="flex-1 space-y-0.5">
            <div className="h-2 w-full grid grid-cols-2 gap-0.5 bg-zinc-950 p-0.5 rounded-sm border border-zinc-800">
              <div
                className={`h-full rounded-xs transition-colors duration-300 ${
                  freezesRemaining >= 1 ? 'bg-[#3B82F6] shadow-[0_0_6px_#3B82F6]' : 'bg-zinc-800'
                }`}
                title="Freeze Segment 1"
              />
              <div
                className={`h-full rounded-xs transition-colors duration-300 ${
                  freezesRemaining >= 2 ? 'bg-[#3B82F6] shadow-[0_0_6px_#3B82F6]' : 'bg-zinc-800'
                }`}
                title="Freeze Segment 2"
              />
            </div>
            <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-bold">
              <span className="text-zinc-500 uppercase">ARM</span>
              <span className="text-blue-400">
                {freezesRemaining}/{maxFreezes} SHIELD
              </span>
            </div>
          </div>
        </div>

        {/* Current Location Readout: Monospace caption below radar */}
        <div className="w-full text-center pt-1 border-t border-zinc-800/80">
          <p className="text-[7.5px] md:text-[8.5px] font-mono font-bold text-zinc-400 tracking-wider truncate uppercase">
            GHAZIABAD // SECTOR-A // MIRAI SCHOOL
          </p>
        </div>
      </motion.div>

      {/* Expanded Quick-Nav Popover if radar tapped */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-0 mb-3 w-72 rounded-xl bg-black/95 border border-zinc-700/80 p-4 text-white shadow-2xl backdrop-blur-md font-mono text-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
                <Compass className="w-4 h-4" />
                <span>RADAR TELEMETRY</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-zinc-500 hover:text-white text-[10px] cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">Campus: <strong>{campusName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Target className="w-3.5 h-3.5 text-[#F7941D] flex-shrink-0" />
                <span className="truncate">Active Blip: <strong>{activeQuestTitle}</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex gap-2">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  if (onOpenMap) onOpenMap();
                }}
                className="flex-1 py-1.5 bg-[#F7941D] hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-wider rounded text-center cursor-pointer transition"
              >
                Open City Map [M]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GtaRadarHud = MinimapHud;
