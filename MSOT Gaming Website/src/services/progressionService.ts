import { useState, useEffect } from 'react';
import type { ActionType, XpTransaction } from '../types/student';

export interface StudentProgression {
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  streakFreezes: number;
  maxFreezes: number;
  leagueRank: number;
  leagueName: string;
  completedNodeIds: string[];
  unlockedBadgeSlugs: string[];
  transactions: XpTransaction[];
}

const STORAGE_KEY = 'msot_student_progression_v3';
const EVENT_NAME = 'msot-progression-sync';

// Clean initial state for new users: Starts at 0 XP, Level 1, 0 streak, no pre-solved questions
const INITIAL_PROGRESSION: StudentProgression = {
  level: 1,
  levelTitle: 'Cadet Recruit',
  currentXp: 0,
  nextLevelXp: 100,
  streakDays: 0,
  streakFreezes: 2,
  maxFreezes: 2,
  leagueRank: 150,
  leagueName: 'Bronze Street Syndicate',
  completedNodeIds: [],
  unlockedBadgeSlugs: [],
  transactions: [],
};

// Calculate level and title from XP
export function calculateLevelFromXp(xp: number): { level: number; title: string; nextLevelXp: number } {
  if (xp < 100) {
    return { level: 1, title: 'Cadet Recruit', nextLevelXp: 100 };
  } else if (xp < 250) {
    return { level: 2, title: 'Street Associate', nextLevelXp: 250 };
  } else if (xp < 500) {
    return { level: 3, title: 'Street Enforcer', nextLevelXp: 500 };
  } else if (xp < 900) {
    return { level: 4, title: 'Crew Lieutenant', nextLevelXp: 900 };
  } else if (xp < 1500) {
    return { level: 5, title: 'Armory Boss', nextLevelXp: 1500 };
  } else if (xp < 2500) {
    return { level: 6, title: 'Heist Specialist', nextLevelXp: 2500 };
  } else if (xp < 4000) {
    return { level: 7, title: 'Syndicate Underboss', nextLevelXp: 4000 };
  } else {
    const level = Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1;
    const nextLevelXp = Math.round(100 * Math.pow(level + 1, 1.5));
    return { level, title: 'Kingpin Operative', nextLevelXp };
  }
}

export const progressionService = {
  getProgression(): StudentProgression {
    if (typeof window === 'undefined') return INITIAL_PROGRESSION;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse progression data:', e);
    }
    return INITIAL_PROGRESSION;
  },

  saveProgression(data: StudentProgression): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
    } catch (e) {
      console.error('Failed to save progression data:', e);
    }
  },

  awardXp(amount: number, actionType: ActionType, verifiedRef: string): StudentProgression {
    const current = this.getProgression();
    const newXp = current.currentXp + amount;
    const { level, title, nextLevelXp } = calculateLevelFromXp(newXp);

    const now = new Date();
    const formattedTimestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} // ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} IST`;

    const newTransaction: XpTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actionType,
      amount,
      verifiedRef,
      createdAt: formattedTimestamp,
      voided: false,
    };

    // Calculate updated streak: if streak was 0 and XP awarded, bump to 1 day
    const updatedStreak = current.streakDays === 0 ? 1 : current.streakDays;

    const updated: StudentProgression = {
      ...current,
      currentXp: newXp,
      level,
      levelTitle: title,
      nextLevelXp,
      streakDays: updatedStreak,
      transactions: [newTransaction, ...current.transactions],
    };

    this.saveProgression(updated);
    return updated;
  },

  completeSector(nodeId: string): StudentProgression {
    const current = this.getProgression();
    const completedSet = new Set(current.completedNodeIds);
    completedSet.add(nodeId);

    const badgeSet = new Set(current.unlockedBadgeSlugs);
    if (nodeId === 'node-1') badgeSet.add('recursion-kingpin');
    if (nodeId === 'node-2') badgeSet.add('memory-allocator');
    if (nodeId === 'node-3') badgeSet.add('sql-heist-master');
    if (nodeId === 'node-5') badgeSet.add('century-club');

    const updated: StudentProgression = {
      ...current,
      completedNodeIds: Array.from(completedSet),
      unlockedBadgeSlugs: Array.from(badgeSet),
    };

    this.saveProgression(updated);
    return updated;
  },

  resetToZero(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: INITIAL_PROGRESSION }));
  },
};

export function useProgression(): {
  progression: StudentProgression;
  awardXp: (amount: number, actionType: ActionType, verifiedRef: string) => StudentProgression;
  completeSector: (nodeId: string) => StudentProgression;
  resetToZero: () => void;
} {
  const [progression, setProgression] = useState<StudentProgression>(() => progressionService.getProgression());

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<StudentProgression>;
      setProgression(customEvent.detail || progressionService.getProgression());
    };

    window.addEventListener(EVENT_NAME, handleSync);
    return () => window.removeEventListener(EVENT_NAME, handleSync);
  }, []);

  return {
    progression,
    awardXp: (amount, actionType, verifiedRef) => progressionService.awardXp(amount, actionType, verifiedRef),
    completeSector: (nodeId) => progressionService.completeSector(nodeId),
    resetToZero: () => progressionService.resetToZero(),
  };
}
