export type QuestionCategory = 'MCQ' | 'CODE_ANALYSIS' | 'BUG_HUNT';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  codeSnippet?: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
}

export type SectorType = 'safehouse' | 'gun_store' | 'fog_of_war' | 'boss_battle';

export interface QuestSector {
  id: string;
  title: string;
  type: SectorType;
  topic: string;
  xpReward: number;
  status: 'completed' | 'in_progress' | 'locked';
  description: string;
  timeLimitSeconds?: number;
  questions: QuizQuestion[];
}

export interface QuestSubmissionResult {
  totalQuestions: number;
  correctCount: number;
  accuracyPercentage: number;
  xpEarned: number;
  timeSpentSeconds: number;
  passed: boolean;
}
