// ─── Bot Battle Types ───────────────────────────────────
// Types for AI Bot battles

import type { BattleVerdict } from "./battle";

export type BotTier = "beginner" | "rookie" | "intermediate" | "advanced" | "expert" | "grandmaster";

export interface BotTierConfig {
  tier: BotTier;
  label: string;
  elo: number;
  icon: string;
  color: string;
  solveTimeMinRange: [number, number]; // [min, max] in minutes
  wrongAttempts: [number, number];     // [min, max] random wrong submissions
  canSolveDifficulties: ("EASY" | "MEDIUM" | "HARD")[];
  description: string;
}

export const BOT_TIERS: BotTierConfig[] = [
  {
    tier: "beginner", label: "Beginner", elo: 800,
    icon: "🗡️", color: "#6B7280",
    solveTimeMinRange: [18, 25], wrongAttempts: [2, 3],
    canSolveDifficulties: ["EASY"],
    description: "Solves only Easy problems. Makes 2–3 wrong submissions first.",
  },
  {
    tier: "rookie", label: "Rookie", elo: 1000,
    icon: "⚔️", color: "#3B82F6",
    solveTimeMinRange: [12, 20], wrongAttempts: [1, 2],
    canSolveDifficulties: ["EASY", "MEDIUM"],
    description: "Solves Easy fast, Medium slow. Takes 12–20 min.",
  },
  {
    tier: "intermediate", label: "Intermediate", elo: 1200,
    icon: "🔥", color: "#F59E0B",
    solveTimeMinRange: [8, 15], wrongAttempts: [0, 1],
    canSolveDifficulties: ["EASY", "MEDIUM"],
    description: "Solves Easy/Medium. Takes 8–15 min. One wrong attempt.",
  },
  {
    tier: "advanced", label: "Advanced", elo: 1500,
    icon: "💎", color: "#8B5CF6",
    solveTimeMinRange: [5, 10], wrongAttempts: [0, 0],
    canSolveDifficulties: ["EASY", "MEDIUM", "HARD"],
    description: "Solves Easy/Medium/Hard. Takes 5–10 min. Clean solution.",
  },
  {
    tier: "expert", label: "Expert", elo: 1800,
    icon: "⚡", color: "#EC4899",
    solveTimeMinRange: [3, 6], wrongAttempts: [0, 0],
    canSolveDifficulties: ["EASY", "MEDIUM", "HARD"],
    description: "Solves all. Takes 3–6 min. Optimal solution.",
  },
  {
    tier: "grandmaster", label: "Grandmaster", elo: 2200,
    icon: "👑", color: "#EF4444",
    solveTimeMinRange: [1, 3], wrongAttempts: [0, 0],
    canSolveDifficulties: ["EASY", "MEDIUM", "HARD"],
    description: "Solves all instantly. Takes 1–3 min. Always beats you.",
  },
];

export interface BotSolveRequest {
  problemSlug: string;
  tier: BotTier;
}

export interface BotSolveResult {
  solution: string;
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
  simulatedTimeMs: number;
  wrongAttempts: number;
}

export interface BotBattleState {
  botBattleId: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  botTier: BotTier;
  botElo: number;
  timeLimitSec: number;
  remainingSec: number;
  botProgress: number;        // 0–100
  botWrongAttempts: number;
  botSubmitted: boolean;
  botVerdict: BattleVerdict | null;
  userSubmitted: boolean;
  userVerdict: BattleVerdict | null;
  phase: "IN_PROGRESS" | "COMPLETED";
}

export interface AIReviewRequest {
  code: string;
  problemDescription: string;
  problemTitle: string;
  starterCode: string;
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
}

export interface AIReviewResult {
  timeComplexity: string;
  spaceComplexity: string;
  optimalTimeComplexity: string;
  isOptimal: boolean;
  strengths: string[];
  improvements: string[];
  interviewTip: string;
  alternativeApproach: string;
  interviewScore: number; // out of 10
}

export interface ProblemStats {
  solveRate: number;          // % of users who solved it
  avgSolveTimeMs: number;
  userTimeMs: number;
  fasterThanPercent: number;  // % of users you're faster than
  totalAttempts: number;
  firstAttemptRate: number;   // % who got it first try
}
