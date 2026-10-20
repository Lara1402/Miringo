import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Swords, Terminal, Trophy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { introAudio } from '../../utils/introAudio';

export interface WeaponWheelItem {
  id: string;
  name: string;
  category: string;
  ammoOrStat: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  angle: number; // 0, 90, 180, 270
}

interface WeaponWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMap?: () => void;
  onStartQuiz?: () => void;
}

export const WeaponWheel: React.FC<WeaponWheelProps> = ({
  isOpen,
  onClose,
  onOpenMap,
}) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items: WeaponWheelItem[] = useMemo(
    () => [
      {
        id: 'syllabus_map',
        name: 'LOS SANTOS SYLLABUS MAP',
        category: 'TACTICAL GPS',
        ammoOrStat: '5 DISTRICTS',
        description: 'Open full-scale topographic roadmap with safehouses, coding armories, and boss battle fortress.',
        icon: <Map className="w-8 h-8" />,
        angle: 0, // Top
        action: () => {
          if (onOpenMap) {
            onOpenMap();
          } else {
            navigate('/syllabus');
          }
        },
      },
      {
        id: 'daily_heist',
        name: 'AMMU-NATION: RECURSION ARMORY',
        category: 'ACTIVE QUEST',
        ammoOrStat: '4 QUESTIONS',
        description: 'Timed rapid-fire question gauntlet. Solve recursive challenges to verify competence.',
        icon: <Swords className="w-8 h-8" />,
        angle: 90, // Right
        action: () => {
          navigate('/quest/node-2');
        },
      },
      {
        id: 'coding_terminal',
        name: 'LEETCODE ALGORITHM ARMORY',
        category: 'CODING ARENA',
        ammoOrStat: '4 CHALLENGES',
        description: 'Practice high-frequency LeetCode challenges: Two Sum, Valid Parentheses, Invert Tree, and Climbing Stairs DP.',
        icon: <Terminal className="w-8 h-8" />,
        angle: 180, // Bottom
        action: () => {
          navigate('/quest/node-leetcode');
        },
      },
      {
        id: 'leagues',
        name: 'OPERATIVE DOSSIER & ARMORY',
        category: 'CREW STANDINGS',
        ammoOrStat: 'TIER 1 ELITE',
        description: 'Inspect mugshot, Wanted streak meter, reputation medallions, and immutable FIB log.',
        icon: <Trophy className="w-8 h-8" />,
        angle: 270, // Left
        action: () => {
          navigate('/student');
        },
      },
    ],
    [navigate, onOpenMap]
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedIndex !== index) {
        introAudio.playWeaponWheelTick();
        setSelectedIndex(index);
      }
    },
    [selectedIndex]
  );

  const executeAction = useCallback(
    (item: WeaponWheelItem) => {
      introAudio.playWeaponWheelTick();
      item.action();
      onClose();
    },
    [onClose]
  );

  // Key navigation within wheel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleSelect(0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSelect(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleSelect(2);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSelect(3);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        executeAction(items[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, handleSelect, executeAction, items, onClose]);

  const activeItem = items[selectedIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Top Bar Hint */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 font-mono text-xs text-zinc-400 bg-black/80 px-4 py-1.5 rounded-full border border-zinc-800 z-30">
            <span className="text-amber-400 font-bold">[TAB] / ARROWS</span> TO CYCLE •
            <span className="text-white font-bold">[ENTER]</span> TO SELECT •
            <span className="text-red-400">[ESC]</span> TO CLOSE
          </div>

          <div
            className="relative flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The GTA V Radial Weapon Wheel Container */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)]" />

              {/* 4 Quadrant Slices */}
              {items.map((item, index) => {
                const isSelected = selectedIndex === index;
                // Positions: 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
                const positions = [
                  'top-2 left-1/2 -translate-x-1/2',
                  'right-2 top-1/2 -translate-y-1/2',
                  'bottom-2 left-1/2 -translate-x-1/2',
                  'left-2 top-1/2 -translate-y-1/2',
                ];

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => handleSelect(index)}
                    onClick={() => executeAction(item)}
                    className={`absolute ${positions[index]} z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'bg-[#F7941D] text-black border-amber-300 shadow-[0_0_35px_rgba(247,148,29,0.8)] scale-110'
                        : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    <div className="p-2">{item.icon}</div>
                    <span
                      className={`text-[9px] font-mono font-black uppercase tracking-wider text-center px-1 line-clamp-1 ${
                        isSelected ? 'text-black' : 'text-zinc-400'
                      }`}
                    >
                      {item.name.split(' ')[0]}
                    </span>
                  </motion.div>
                );
              })}

              {/* Center Weapon Wheel HUD Choosing Option Display */}
              <div
                onClick={() => executeAction(activeItem)}
                className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-black/95 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.45)] flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-amber-300 hover:scale-105 transition-all"
                title="Click to Equip / Launch"
              >
                <span className="text-[9px] font-mono font-black text-amber-400 tracking-widest uppercase">
                  {activeItem.category}
                </span>

                <h3 className="font-chalet text-base sm:text-lg font-black text-white uppercase tracking-tight mt-1 line-clamp-1 gta-text-shadow">
                  {activeItem.name}
                </h3>

                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold mt-1">
                  {activeItem.ammoOrStat}
                </span>

                <p className="text-[9.5px] font-sans text-zinc-400 mt-2 line-clamp-2 px-1">
                  {activeItem.description}
                </p>

                <div className="mt-2 px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  ENTER TO LAUNCH
                </div>
              </div>
            </div>

            {/* Close Button below */}
            <button
              onClick={onClose}
              className="mt-8 px-6 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs uppercase font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Exit Wheel [ESC]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
