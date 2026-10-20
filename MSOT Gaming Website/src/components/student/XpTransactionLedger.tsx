import React, { useState, useMemo } from 'react';
import { Terminal, Clock, FileText, CheckCircle2, AlertTriangle, Hash, Search, X } from 'lucide-react';
import { introAudio } from '../../utils/introAudio';
import type { XpTransaction, ActionType } from '../../types/student';

const DEFAULT_HISTORY: XpTransaction[] = [];

export interface XpTransactionLedgerProps {
  history?: XpTransaction[];
  className?: string;
}

export const XpTransactionLedger: React.FC<XpTransactionLedgerProps> = ({
  history = DEFAULT_HISTORY,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { key: 'ALL', label: 'ALL' },
    { key: 'ATTENDANCE', label: 'ATTENDANCE' },
    { key: 'HOMEWORK', label: 'HOMEWORK' },
    { key: 'DAILY_QUIZ', label: 'QUIZZES' },
    { key: 'CODING', label: 'CODING' },
    { key: 'TEST_SCORE', label: 'TESTS' },
    { key: 'PEER_HELP', label: 'PEER HELP' },
    { key: 'MILESTONE', label: 'MILESTONES' },
  ];

  const handleTabClick = (key: string) => {
    introAudio.playWeaponWheelTick();
    setActiveFilter(key);
  };

  const matchesFilter = (actionType: ActionType, filter: string): boolean => {
    if (filter === 'ALL') return true;
    if (filter === 'HOMEWORK') return actionType === 'HOMEWORK_SUBMISSION';
    if (filter === 'CODING') return actionType.startsWith('CODING');
    if (filter === 'MILESTONE') return actionType === 'STREAK_MILESTONE';
    return actionType === filter;
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const passesFilter = matchesFilter(item.actionType, activeFilter);
      if (!passesFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchRef = item.verifiedRef.toLowerCase().includes(q);
      const matchAction = item.actionType.toLowerCase().includes(q);
      const matchReason = item.voidReason?.toLowerCase().includes(q) ?? false;
      return matchRef || matchAction || matchReason;
    });
  }, [history, activeFilter, searchQuery]);

  const verifiedTotal = useMemo(() => {
    return history
      .filter((item) => !item.voided)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [history]);

  const voidedCount = useMemo(() => {
    return history.filter((item) => item.voided).length;
  }, [history]);

  return (
    <div className={`bg-[#121418] border border-zinc-800 p-6 rounded-xl shadow-2xl select-none ${className}`}>
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-black uppercase font-mono tracking-wide text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-500" />
            REPUTATION LEDGER // IMMUTABLE FIB LOG
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">
            CRYPTOGRAPHIC RECORD OF ALL VERIFIED ACADEMIC AND CODING EVENTS
          </p>
        </div>

        {/* Telemetry pill */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2">
            <span className="text-zinc-500 uppercase">NET VERIFIED:</span>
            <span className="text-emerald-400 font-black" style={{ textShadow: '0 0 8px rgba(34,197,94,0.4)' }}>
              ${verifiedTotal.toLocaleString()} XP
            </span>
          </div>
          {voidedCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{voidedCount} VOIDED</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Input Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hash, operation, or notes..."
            className="w-full pl-8 pr-8 py-1.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 text-xs font-mono text-zinc-200 placeholder-zinc-600 rounded-md outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                introAudio.playWeaponWheelTick();
                setSearchQuery('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 font-mono text-[10px] uppercase">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`px-2.5 py-1.5 border rounded-sm transition-all cursor-pointer font-bold ${
                activeFilter === tab.key
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Records List */}
      <div className="divide-y divide-zinc-800/80 font-mono">
        {filteredHistory.map((item) => {
          return (
            <div
              key={item.id}
              className={`py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs transition-colors rounded-lg px-2 ${
                item.voided ? 'bg-red-950/15' : 'hover:bg-zinc-900/40'
              }`}
            >
              {/* Left Item Details */}
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg border mt-0.5 ${
                    item.voided
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {item.voided ? <AlertTriangle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-zinc-200 uppercase tracking-wide">
                      {item.actionType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
                      <Hash className="w-3 h-3 text-zinc-600" />
                      [{item.verifiedRef}]
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{item.createdAt}</span>
                  </div>

                  {item.voided && (
                    <div className="text-[10px] font-bold text-red-400 uppercase mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      VOIDED: {item.voidReason || 'Flagged by academic review'}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Respect XP & Status Badge */}
              <div className="text-right flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-800/60 pt-2 md:pt-0">
                {/* Respect (XP) Column */}
                <span
                  className={`text-sm sm:text-base font-black tracking-wider ${
                    item.voided ? 'text-red-500 line-through' : 'text-[#22C55E]'
                  }`}
                  style={!item.voided ? { textShadow: '0 0 8px rgba(34, 197, 94, 0.5)' } : {}}
                >
                  {item.voided ? `-$${item.amount} XP` : `+$${item.amount} XP`}
                </span>

                {/* Status Column */}
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-1 rounded border tracking-wider flex items-center gap-1 ${
                    item.voided
                      ? 'border-red-800/80 bg-red-950/60 text-red-400'
                      : 'border-emerald-800/80 bg-emerald-950/60 text-emerald-400'
                  }`}
                  title={item.voided ? item.voidReason : 'Cryptographically verified transaction'}
                >
                  {item.voided ? (
                    <>
                      <AlertTriangle className="w-3 h-3" /> VOIDED
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="py-12 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest flex flex-col items-center justify-center gap-2">
          <Terminal className="w-8 h-8 text-zinc-700 mb-1" />
          <span>NO REPUTATION TRANSACTIONS RECORDED YET</span>
          <span className="text-[10px] text-zinc-600 normal-case">
            Complete your first sector quest or algorithm challenge to earn respect and log cryptographic audit history.
          </span>
        </div>
      )}
    </div>
  );
};
