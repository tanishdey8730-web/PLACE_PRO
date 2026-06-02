export type DailyChallengeType = "dsa" | "aptitude" | "interview";

export type PlacementGoal =
  | "product_company"
  | "service_company"
  | "faang"
  | "core_cs"
  | "general";

export const PLACEMENT_GOALS: { id: PlacementGoal; label: string }[] = [
  { id: "product_company", label: "Product-based company" },
  { id: "service_company", label: "Service-based company" },
  { id: "faang", label: "FAANG / top tech" },
  { id: "core_cs", label: "Core CS / backend roles" },
  { id: "general", label: "General placement prep" },
];

export interface DailyChallengeItem {
  id: string;
  type: DailyChallengeType;
  topic: string;
  difficulty: string;
  title: string;
  prompt: string;
  options?: string[];
  hints?: string[];
  estimatedMinutes: number;
  codingSlug?: string;
  completed: boolean;
  completedAt?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface DailyChallengeProgressSnapshot {
  codingScore: number;
  aptitudeScore: number;
  interviewScore: number;
  placementReadiness: number;
  dailyStreak: number;
  recentSolvedCategories: string[];
  weakCategories: string[];
}

export interface DailyChallengeSet {
  id: string;
  challengeDate: string;
  placementGoal: PlacementGoal;
  placementGoalLabel: string;
  weakTopics: string[];
  progress: DailyChallengeProgressSnapshot;
  challenges: DailyChallengeItem[];
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  isDayComplete: boolean;
  xpEarnedToday: number;
  summary: string;
  createdAt: string;
}

export interface DailyChallengeHistoryItem {
  id: string;
  challengeDate: string;
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  isDayComplete: boolean;
  placementGoal: PlacementGoal;
}

export interface CompleteDailyChallengeInput {
  setId: string;
  challengeId: string;
  answer?: string;
}

export interface CompleteDailyChallengeResult {
  challenge: DailyChallengeItem;
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  isDayComplete: boolean;
  xpAwarded: number;
}
