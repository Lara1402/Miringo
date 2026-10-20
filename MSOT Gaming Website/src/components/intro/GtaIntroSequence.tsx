import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Crosshair, Radio, Zap } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';

interface GtaIntroProps {
  onComplete: () => void;
}

export const GtaIntroSequence: React.FC<GtaIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'comic' | 'satellite' | 'done'>('comic');
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(() => introAudio.getMuted());
  const [satelliteAltitude, setSatelliteAltitude] = useState(15400);

  const satiricalQuotes = [
    'Why did I move here? I guess it was the syllabus.',
    'Bypassing Ghaziabad traffic... Synchronizing compute nodes...',
    "Remember: Pull requests don't fix missing attendance.",
    'Connecting to MSOT Central Mainframe...',
    "75% attendance isn't a suggestion, it's a 5-star wanted level.",
    'Wasted 4 hours debugging an off-by-one recursion tree.',
    'Weapon of choice: Vim, energy drinks, and pure caffeine.',
    'Respect is earned in the terminal, not the lecture hall.'
  ];

  // Cycling satirical subtext
  useEffect(() => {
    if (stage !== 'comic') return;
    const interval = setInterval(() => {
      setSubtitleIdx((prev) => (prev + 1) % satiricalQuotes.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [stage, satiricalQuotes.length]);

  // Satellite altitude countdown during Stage 2
  useEffect(() => {
    if (stage !== 'satellite') return;
    const interval = setInterval(() => {
      setSatelliteAltitude((prev) => Math.max(0, prev - 950));
    }, 80);
    return () => clearInterval(interval);
  }, [stage]);

  // Toggle audio mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    introAudio.setMuted(next);
  };

  // Immediate skip
  const handleSkip = useCallback(() => {
    introAudio.cleanup();
    setStage('done');
    onComplete();
  }, [onComplete]);

  // Transition from Stage 1 (Comic) -> Stage 2 (Satellite Zoom) -> Direct App Enter
  const handleStartHeist = useCallback(() => {
    if (stage !== 'comic') return;
    introAudio.resume();
    introAudio.playCharacterSwitch();
    setStage('satellite');

    // After 2.0s of satellite drop, complete onboarding directly into the platform
    setTimeout(() => {
      introAudio.cleanup();
      setStage('done');
      onComplete();
    }, 2000);
  }, [stage, onComplete]);

  // Spacebar and Escape key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (stage === 'comic') {
          handleStartHeist();
        } else {
          handleSkip();
        }
      } else if (e.code === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, handleStartHeist, handleSkip]);

  return (
    <AnimatePresence mode="wait">
      {stage !== 'done' && (
        <motion.div
          key="gta-intro-container"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0A0A0A] text-white overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* ============================================================== */}
          {/* STAGE 1: VINEWOOD MULTI-PANEL COMIC SPLIT SCREEN              */}
          {/* ============================================================== */}
          {stage === 'comic' && (
            <motion.div
              key="stage-comic"
              className="absolute inset-0 flex flex-col justify-between overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {/* 3 Animated Comic Panels with GTA Easing */}
              <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3 pointer-events-none">
                {/* Panel 1: Computer Lab at Night */}
                <motion.div
                  className="relative h-full overflow-hidden border-b md:border-b-0 md:border-r-4 border-black"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950 to-purple-950/40" />
                  {/* Stylized Vector Lab Graphic */}
                  <svg className="absolute inset-0 w-full h-full object-cover opacity-60" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="neonSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4c1d95" />
                        <stop offset="60%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                      <linearGradient id="cyberCyan" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="800" fill="url(#neonSky)" />
                    {/* Lab Monitors & Server Racks */}
                    <g opacity="0.7">
                      <rect x="30" y="280" width="140" height="90" rx="6" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" />
                      <rect x="40" y="295" width="120" height="60" fill="#020617" />
                      <path d="M45 310 h40 M45 325 h80 M45 340 h60" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" />
                      
                      <rect x="230" y="260" width="140" height="100" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                      <rect x="240" y="275" width="120" height="70" fill="#020617" />
                      <circle cx="300" cy="310" r="22" fill="none" stroke="#f59e0b" strokeWidth="3" />

                      {/* Neon Skyline */}
                      <path d="M0 600 L60 550 L120 580 L200 510 L280 570 L350 520 L400 560 L400 800 L0 800 Z" fill="#090d16" />
                      <line x1="200" y1="510" x2="200" y2="440" stroke="#f43f5e" strokeWidth="4" />
                      <circle cx="200" cy="435" r="5" fill="#f43f5e" />
                    </g>
                  </svg>
                  <div className="absolute top-24 left-6 z-10">
                    <span className="px-2 py-1 bg-purple-600/90 text-white font-mono text-[11px] font-bold tracking-wider uppercase rounded">
                      SECTOR 01: LAB COMPUTE
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1 gta-text-shadow">
                      Central Server Rack
                    </h3>
                  </div>
                </motion.div>

                {/* Panel 2: The Grinding Student */}
                <motion.div
                  className="relative h-full overflow-hidden border-b md:border-b-0 md:border-r-4 border-black"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950 to-amber-950/40" />
                  {/* Stylized Vector Student Graphic */}
                  <svg className="absolute inset-0 w-full h-full object-cover opacity-60" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
                    <rect width="400" height="800" fill="#050508" />
                    {/* Glowing Headphones & Student Silhouette */}
                    <g transform="translate(40, 180)">
                      {/* Laptop Screen glow */}
                      <polygon points="40,320 280,320 310,480 10,480" fill="rgba(245, 158, 11, 0.2)" />
                      {/* Laptop Base & Display */}
                      <rect x="50" y="240" width="220" height="130" rx="8" fill="#18181b" stroke="#f59e0b" strokeWidth="4" />
                      <rect x="65" y="255" width="190" height="100" fill="#09090b" />
                      <text x="75" y="285" fill="#22c55e" fontFamily="monospace" fontSize="13" fontWeight="bold">ACCEPTED +40 XP</text>
                      <text x="75" y="305" fill="#38bdf8" fontFamily="monospace" fontSize="11">BinaryTree.invert()</text>
                      <text x="75" y="325" fill="#a1a1aa" fontFamily="monospace" fontSize="10">LeetCode Runtime: 0ms</text>
                      <rect x="30" y="370" width="260" height="16" rx="4" fill="#27272a" />

                      {/* Sprunk / Energy Can */}
                      <rect x="275" y="320" width="30" height="65" rx="5" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
                      <text x="280" y="355" fill="#052e16" fontFamily="Arial Black" fontSize="9" transform="rotate(-90 280 355)">SPRUNK</text>
                    </g>
                  </svg>
                  <div className="absolute top-24 left-6 z-10">
                    <span className="px-2 py-1 bg-amber-600/90 text-black font-mono text-[11px] font-black tracking-wider uppercase rounded">
                      SECTOR 02: CODE HEIST
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1 gta-text-shadow">
                      The Algorithm Runner
                    </h3>
                  </div>
                </motion.div>

                {/* Panel 3: Professor Terminal & Attendance Alert */}
                <motion.div
                  className="relative h-full overflow-hidden"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950 to-red-950/40" />
                  {/* Stylized Vector Busted Terminal */}
                  <svg className="absolute inset-0 w-full h-full object-cover opacity-60" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
                    <rect width="400" height="800" fill="#090305" />
                    {/* Busted Warning Banner Vector */}
                    <g transform="translate(30, 240)">
                      <rect x="10" y="40" width="320" height="180" rx="8" fill="#1c050a" stroke="#ef4444" strokeWidth="4" />
                      <path d="M10 40 L330 40 L310 75 L10 75 Z" fill="#dc2626" />
                      <text x="25" y="65" fill="#ffffff" fontFamily="Impact, Arial Black" fontSize="22" letterSpacing="2">ATTENDANCE AUDIT</text>
                      
                      <rect x="30" y="95" width="280" height="50" fill="#000000" rx="4" />
                      <text x="50" y="128" fill="#ef4444" fontFamily="Impact, Arial Black" fontSize="26" letterSpacing="3">BUSTED: 68%</text>

                      <circle cx="270" cy="180" r="18" fill="#ef4444" />
                      <path d="M265 170 L275 180 M275 170 L265 180" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  </svg>
                  <div className="absolute top-24 left-6 z-10">
                    <span className="px-2 py-1 bg-red-600/90 text-white font-mono text-[11px] font-bold tracking-wider uppercase rounded">
                      SECTOR 03: DEFENSE DEPT
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1 gta-text-shadow">
                      Bi-Weekly Vigilance
                    </h3>
                  </div>
                </motion.div>
              </div>

              {/* Comic Panel Vignette Shadow Overlays */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/80" />

              {/* TOP HEADER: GTA V TITLE & CONTROLS */}
              <div className="relative z-20 flex justify-between items-start px-6 md:px-12 pt-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-pricedown text-6xl md:text-8xl text-white gta-text-shadow leading-none tracking-tight">
                      MSOT <span className="text-[#F7941D]">V</span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-[10px] md:text-xs font-black uppercase tracking-widest bg-[#F7941D] text-black rounded font-mono">
                      LOS SANTOS : MSOT EDITION
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold hidden sm:inline">
                      Semester San Andreas • v5.0
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="p-2.5 rounded-lg bg-black/70 border border-zinc-700/80 hover:border-amber-500/80 text-zinc-300 hover:text-white transition-all cursor-pointer"
                    title={isMuted ? 'Unmute GTA Sound FX' : 'Mute Sound FX'}
                    aria-label={isMuted ? 'Unmute GTA Sound FX' : 'Mute Sound FX'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={handleSkip}
                    className="text-xs font-mono font-bold uppercase bg-black/70 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 px-4 py-2.5 rounded tracking-widest text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    Skip Intro <span className="text-zinc-500 text-[10px] ml-1">[ESC]</span>
                  </button>
                </div>
              </div>

              {/* CENTER STAGE: SATIRICAL SUBTEXT & START HEIST */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto my-auto">
                <motion.div
                  key={subtitleIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="px-6 py-4 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-800/80 shadow-2xl"
                >
                  <p className="font-chalet text-xl md:text-3xl font-black uppercase tracking-wide text-zinc-100 gta-text-shadow">
                    "{satiricalQuotes[subtitleIdx]}"
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartHeist}
                  className="mt-8 px-10 py-4 bg-gradient-to-r from-[#F7941D] to-[#FBBF24] hover:from-[#f59e0b] hover:to-[#fbbf24] text-black font-black text-base md:text-lg tracking-widest uppercase rounded shadow-[0_0_35px_rgba(247,148,29,0.6)] border-2 border-amber-300 transition-all cursor-pointer flex items-center gap-3 font-chalet"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  START HEIST / ENTER CAMPUS
                  <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded ml-1">
                    [SPACE]
                  </span>
                </motion.button>
              </div>

              {/* BOTTOM BAR: SPINNING GOLD LOADING COG & TELEMETRY */}
              <div className="relative z-20 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 px-6 md:px-12 pb-8">
                <div className="flex items-center gap-3 bg-black/80 px-4 py-2 rounded-lg border border-zinc-800">
                  {/* Spinning Gold Gear */}
                  <svg className="w-6 h-6 text-[#FBBF24] animate-gta-cog flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span className="font-mono text-xs tracking-widest uppercase text-amber-300 font-bold">
                    LOADING REVISION MODULE...
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono tracking-wider uppercase text-center sm:text-right">
                  Mirai School of Technology • Los Santos Campus Engine • Autumn Term
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* STAGE 2: "CHARACTER SWITCH" SATELLITE CAMERA DROP             */}
          {/* ============================================================== */}
          {stage === 'satellite' && (
            <motion.div
              key="stage-satellite"
              className="absolute inset-0 flex flex-col justify-between p-8 bg-[#020617] overflow-hidden"
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{
                scale: [1, 3.8, 1.2, 1],
                opacity: [0.6, 1, 0.9, 1],
                filter: ['blur(14px)', 'blur(0px)', 'blur(4px)', 'blur(0px)'],
              }}
              transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Satellite Map Vector Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Contour roads & zones */}
                  <circle cx="50%" cy="50%" r="220" fill="none" stroke="rgba(247, 148, 29, 0.4)" strokeWidth="2" strokeDasharray="8 6" />
                  <circle cx="50%" cy="50%" r="380" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1.5" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>

              {/* Radio static scanlines */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.85)_100%)]" />

              {/* High Altitude Telemetry Header */}
              <div className="relative z-10 flex justify-between items-start font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest uppercase">
                    <Radio className="w-4 h-4 animate-pulse" /> SATELLITE UPLINK: LOCK ACQUIRED
                  </div>
                  <p className="text-zinc-400">TARGET: MSOT GHAZIABAD MAIN CAMPUS</p>
                  <p className="text-zinc-500 text-[10px]">COORDINATES: 28.6692° N, 77.4538° E</p>
                </div>

                <div className="text-right font-mono">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
                    ALT: {satelliteAltitude.toLocaleString()} FT
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-1">CAMERA: ORBITAL PLUNGE</p>
                </div>
              </div>

              {/* Center Crosshair Target */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <Crosshair className="w-full h-full text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute w-14 h-14 rounded-full border-2 border-red-500 animate-ping opacity-75" />
                  <div className="absolute text-center">
                    <p className="font-pricedown text-2xl text-white gta-text-shadow">MSOT V</p>
                    <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase">SECTOR 04</p>
                  </div>
                </div>
                <p className="mt-4 font-chalet text-xl font-black text-amber-400 tracking-widest uppercase gta-text-shadow">
                  SWITCHING TO STUDENT OPERATIVE...
                </p>
              </div>

              {/* Bottom Telemetry */}
              <div className="relative z-10 flex justify-between items-end font-mono text-[10px] text-zinc-500 uppercase">
                <span>CHANNEL: LOS SANTOS RADIO 102.7 FM</span>
                <span className="text-emerald-400 font-bold">RADAR TELEMETRY ACTIVE</span>
              </div>
            </motion.div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};
