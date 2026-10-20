import React from 'react';
import { Eye, EyeOff, ShieldAlert, Radio } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';

export interface OperativeHeaderProps {
  realName: string;
  maskedName: string;
  campus: string;
  section: string;
  title: string;
  league: string;
  anonymousMode: boolean;
  onToggleAnonymous: () => void;
  className?: string;
}

export const OperativeHeader: React.FC<OperativeHeaderProps> = ({
  realName,
  maskedName,
  campus,
  section,
  title,
  league,
  anonymousMode,
  onToggleAnonymous,
  className = '',
}) => {
  const handleToggle = () => {
    introAudio.playWeaponWheelTick();
    onToggleAnonymous();
  };

  return (
    <div
      className={`w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0D1117] border border-zinc-800 p-4 rounded-xl backdrop-blur-md shadow-xl select-none ${className}`}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Operative Identity / Masked Identity */}
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase font-mono drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
              anonymousMode ? 'text-amber-400 flex items-center gap-2' : 'text-zinc-100'
            }`}
          >
            {anonymousMode && <ShieldAlert className="w-7 h-7 text-amber-400 animate-pulse" />}
            {anonymousMode ? maskedName : realName}
          </h1>

          {/* Syndicate / Title Badge */}
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 uppercase tracking-widest rounded-sm">
            {title}
          </span>

          {/* Live Uplink Pill */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE TELEMETRY
          </span>
        </div>

        {/* Telemetry Subtext */}
        <p className="text-[11px] sm:text-xs font-mono uppercase text-zinc-400 tracking-wider">
          CAMPUS: <span className="text-zinc-200">{campus}</span> // SECTOR:{' '}
          <span className="text-zinc-200">{section}</span> // SYNDICATE:{' '}
          <span className="text-amber-400">{league}</span>
        </p>
      </div>

      {/* Interactive Anonymity Toggle ("GO DARK") */}
      <button
        onClick={handleToggle}
        className={`mt-4 md:mt-0 flex items-center gap-2 px-4 py-2.5 border font-mono text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
          anonymousMode
            ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
            : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
        }`}
        title="Toggle campus leaderboard anonymity"
      >
        {anonymousMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {anonymousMode ? 'STEALTH ACTIVE (ANONYMOUS)' : 'GO DARK (ANONYMOUS MODE)'}
      </button>
    </div>
  );
};
