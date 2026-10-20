export type ActionType = 
  | 'ATTENDANCE' 
  | 'HOMEWORK_SUBMISSION' 
  | 'DAILY_QUIZ' 
  | 'TEST_SCORE' 
  | 'CODING_EASY' 
  | 'CODING_MEDIUM' 
  | 'CODING_HARD' 
  | 'CLUB_PARTICIPATION' 
  | 'STREAK_MILESTONE' 
  | 'PEER_HELP';

export interface XpTransaction {
  id: string;
  actionType: ActionType;
  amount: number;
  verifiedRef: string; // e.g., "ATT-LEC-401", "GH-COMMIT-7a9f", "TEST-MID-CS201"
  createdAt: string;
  voided: boolean;
  voidReason?: string;
}

export interface BadgeItem {
  id: string;
  slug: string;
  name: string;
  category: 'TOPIC_QUEST' | 'MILESTONE' | 'IMPROVEMENT';
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  description: string;
  criteria?: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  verificationSource?: string;
}

export interface StudentProfile {
  id: string;
  realName: string;
  maskedAlias: string; // e.g., "OPERATIVE #7F9A"
  campus: string;
  section: string;
  level: number;
  levelTitle: string; // e.g., "Street Lieutenant", "Syndicate Boss"
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  streakFreezes: number; // 0 to 2
  maxFreezes: number;
  anonymousMode: boolean;
  leagueName: string;
  leagueRank: number;
  totalTransactions: number;
}
