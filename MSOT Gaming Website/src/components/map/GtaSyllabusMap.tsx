import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Crosshair, Swords, HelpCircle, Skull,
  Home, ChevronRight, Zap
} from 'lucide-react';
import { introAudio } from '../../utils/introAudio';

interface SyllabusNode {
  id: string;
  title: string;
  type: 'safehouse' | 'gun_store' | 'fog_of_war' | 'boss_battle';
  topic: string;
  xpReward: number;
  status: 'completed' | 'in_progress' | 'locked';
  x: number; // percentage
  y: number; // percentage
  description: string;
}

interface GtaSyllabusMapProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuest?: (node: SyllabusNode) => void;
  completedNodeIds?: string[];
}

const SYLLABUS_NODES: SyllabusNode[] = [
  {
    id: 'node-1',
    title: 'Safehouse Alpha: Intro to Big-O',
    type: 'safehouse',
    topic: 'Time & Space Complexity',
    xpReward: 30,
    status: 'completed',
    x: 25,
    y: 35,
    description: 'Mastered asymptotic analysis, omega, theta, and runtime profiling.',
  },
  {
    id: 'node-2',
    title: 'Ammu-Nation: Recursion Armory',
    type: 'gun_store',
    topic: 'Divide & Conquer & Backtracking',
    xpReward: 40,
    status: 'in_progress',
    x: 48,
    y: 42,
    description: 'Solve 5 verified recursive backtracking problems (N-Queens, Sudoku Solver).',
  },
  {
    id: 'node-3',
    title: 'Ammu-Nation: Dynamic Programming Weapons',
    type: 'gun_store',
    topic: 'Memoization & Tabulation',
    xpReward: 50,
    status: 'in_progress',
    x: 68,
    y: 30,
    description: 'Knapsack 0/1, Longest Common Subsequence, and matrix chain multiplication.',
  },
  {
    id: 'node-4',
    title: 'Strangers & Freaks: Graph Traversals (?)',
    type: 'fog_of_war',
    topic: 'BFS, DFS & Dijkstra Shortest Path',
    xpReward: 45,
    status: 'locked',
    x: 35,
    y: 65,
    description: 'Unlocks in Week 7 after completing mid-term prep micro-challenges.',
  },
  {
    id: 'node-5',
    title: 'Mount Chiliad Fortress: Mid-Term Boss Battle',
    type: 'boss_battle',
    topic: 'Timed Comprehensive Exam Simulation',
    xpReward: 150,
    status: 'locked',
    x: 75,
    y: 72,
    description: 'High-stakes timed revision trial 1 week before the university mid-term exams.',
  },
];

export const GtaSyllabusMap: React.FC<GtaSyllabusMapProps> = ({
  isOpen,
  onClose,
  onStartQuest,
  completedNodeIds = [],
}) => {
  const nodes = useMemo(() => {
    return SYLLABUS_NODES.map((node) => {
      const isCompleted = completedNodeIds.includes(node.id);
      if (isCompleted) {
        return { ...node, status: 'completed' as const };
      }
      if (node.id === 'node-1' || node.id === 'node-2') {
        return { ...node, status: 'in_progress' as const };
      }
      if (node.id === 'node-3' && completedNodeIds.includes('node-2')) {
        return { ...node, status: 'in_progress' as const };
      }
      if (node.id === 'node-4' && completedNodeIds.includes('node-3')) {
        return { ...node, status: 'in_progress' as const };
      }
      if (node.id === 'node-5' && completedNodeIds.includes('node-4')) {
        return { ...node, status: 'in_progress' as const };
      }
      return { ...node, status: 'locked' as const };
    });
  }, [completedNodeIds]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  const [activeTab, setActiveTab] = useState<'MAP' | 'BRIEF' | 'STATS'>('MAP');

  const handleSelectNode = (node: SyllabusNode) => {
    introAudio.playWeaponWheelTick();
    setSelectedNodeId(node.id);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-[#050811] text-white select-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* GTA PAUSE MENU TOP BAR */}
        <div className="bg-black/95 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-pricedown text-2xl text-amber-500 tracking-tight mr-2">
              MSOT V
            </span>
            {(['MAP', 'BRIEF', 'STATS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  introAudio.playWeaponWheelTick();
                  setActiveTab(tab);
                }}
                className={`font-mono text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase hidden sm:inline">
              SECTOR: LOS SANTOS SYLLABUS GRID
            </span>
            <button
              onClick={() => {
                introAudio.playWeaponWheelTick();
                onClose();
              }}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Close [ESC]
            </button>
          </div>
        </div>

        {/* MAIN BODY: SATELLITE MAP (LEFT) + MISSION BRIEF (RIGHT) */}
        <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
          {/* SATELLITE MAP AREA */}
          <div className="flex-1 relative bg-[#090d16] overflow-hidden">
            {/* Vector Roads, Coastlines & Grid */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.45)" strokeWidth="1" />
                </pattern>
                <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#oceanGlow)" />
              <rect width="100%" height="100%" fill="url(#cityGrid)" />

              {/* Highway arterials */}
              <path d="M0,200 Q300,150 500,350 T1200,450" fill="none" stroke="#334155" strokeWidth="6" />
              <path d="M0,200 Q300,150 500,350 T1200,450" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10 10" />

              <path d="M200,0 Q250,400 450,600 T800,1000" fill="none" stroke="#334155" strokeWidth="5" />
              <path d="M500,100 Q650,300 700,600 T900,900" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 6" />

              {/* Connecting Quest Path Lines */}
              <line x1="25%" y1="35%" x2="48%" y2="42%" stroke="#22c55e" strokeWidth="3" strokeDasharray="4 4" />
              <line x1="48%" y1="42%" x2="68%" y2="30%" stroke="#f7941d" strokeWidth="3" strokeDasharray="4 4" />
              <line x1="48%" y1="42%" x2="35%" y2="65%" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="68%" y1="30%" x2="75%" y2="72%" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 4" />

              {/* Fog of War: Gritty Satellite Cloud & Shadow Layer over locked topics */}
              <ellipse cx="35%" cy="65%" rx="16%" ry="12%" fill="rgba(6, 9, 15, 0.82)" filter="url(#oceanGlow)" />
              <ellipse cx="75%" cy="72%" rx="20%" ry="15%" fill="rgba(10, 5, 8, 0.88)" />
            </svg>

            {/* GPS Waypoint Crosshairs */}
            <div className="absolute top-6 left-6 font-mono text-xs text-zinc-400 bg-black/80 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
                <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>WAYPOINT: {selectedNode.title}</span>
              </div>
              <p className="text-[10px] text-zinc-500">GRID: 28.6692° N, 77.4538° E • ZOOM: 100%</p>
            </div>

            {/* MAP BLIPS (NODES) */}
            {nodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  {/* Ping Ring for selected node */}
                  {isSelected && (
                    <div className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
                  )}

                  {/* Icon Box Blip */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-2xl transition-all ${
                      isSelected
                        ? 'scale-125 border-white bg-amber-500 text-black shadow-[0_0_20px_#F59E0B]'
                        : node.type === 'safehouse'
                        ? 'border-emerald-400 bg-emerald-950/90 text-emerald-300'
                        : node.type === 'gun_store'
                        ? 'border-amber-400 bg-amber-950/90 text-amber-300'
                        : node.type === 'boss_battle'
                        ? 'border-red-500 bg-red-950/90 text-red-300'
                        : 'border-zinc-600 bg-zinc-900/90 text-zinc-400'
                    }`}
                  >
                    {node.type === 'safehouse' && <Home className="w-5 h-5 fill-current" />}
                    {node.type === 'gun_store' && <Swords className="w-5 h-5" />}
                    {node.type === 'fog_of_war' && <HelpCircle className="w-5 h-5" />}
                    {node.type === 'boss_battle' && <Skull className="w-5 h-5 fill-current" />}
                  </div>

                  {/* Node Label Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded bg-black/90 border border-zinc-700 text-[10px] font-mono font-bold whitespace-nowrap text-zinc-200 pointer-events-none group-hover:border-amber-400 transition">
                    {node.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE: GTA MISSION BRIEF PANEL */}
          <div className="w-full lg:w-96 bg-black/95 border-t lg:border-t-0 lg:border-l border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedNode.type === 'safehouse' && 'COMPLETED TOPIC'}
                  {selectedNode.type === 'gun_store' && 'ACTIVE CODING PRACTICE'}
                  {selectedNode.type === 'fog_of_war' && 'LOCKED CHAPTER'}
                  {selectedNode.type === 'boss_battle' && 'MID-TERM BOSS FORTRESS'}
                </span>

                <h2 className="font-chalet text-2xl font-black text-white uppercase tracking-tight mt-2 gta-text-shadow">
                  {selectedNode.title}
                </h2>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  Syllabus Unit: {selectedNode.topic}
                </p>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400 uppercase font-medium">Clearance:</span>
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                    selectedNode.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedNode.status === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {selectedNode.status.replace('_', ' ')}
                </span>
              </div>

              {/* Mission Reward */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between font-mono text-xs">
                <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-current" /> RESPECT REWARD:
                </span>
                <span className="text-white font-black text-sm">
                  +{selectedNode.xpReward} XP
                </span>
              </div>

              {/* Briefing Text */}
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-500 font-bold uppercase">
                  MISSION BRIEFING:
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {selectedNode.description}
                </p>
              </div>

              {/* Map Legend */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                  MAP LEGEND / BLIP ICONS:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-emerald-400" /> Completed Safehouse
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-amber-400" /> Algorithmic Armory
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" /> Unexplored Chapter
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-red-400" /> Mid-Term Boss
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6">
              <button
                onClick={() => {
                  introAudio.playCharacterSwitch();
                  if (onStartQuest) onStartQuest(selectedNode);
                  onClose();
                }}
                disabled={selectedNode.status === 'locked'}
                className={`w-full py-3.5 rounded-xl font-chalet text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedNode.status === 'locked'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300'
                }`}
              >
                {selectedNode.status === 'locked'
                  ? 'CHAPTER LOCKED'
                  : selectedNode.status === 'completed'
                  ? 'REVISIT MODULE'
                  : 'LAUNCH MISSION / PRACTICE'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
