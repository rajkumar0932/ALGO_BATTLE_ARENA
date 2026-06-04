// ─── Battle Types ────────────────────────────────────────
// Shared interfaces for battle state and results

export interface BattlePlayer {
  userId: string;
  username: string;
  rating: number;
  socketId?: string;
  hasSubmitted: boolean;
  submissionId?: string;
  verdict?: BattleVerdict;
  executionTimeMs?: number;
  passedCases?: number;
  totalCases?: number;
}

export type BattleVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "PENDING";

export type BattlePhase =
  | "WAITING"       // Waiting for opponent
  | "COUNTDOWN"     // 3-2-1 countdown before start
  | "IN_PROGRESS"   // Battle is active
  | "COMPLETED"     // Battle ended normally
  | "CANCELLED";    // Battle was cancelled

export interface BattleState {
  battleId: string;
  phase: BattlePhase;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  timeLimitSec: number;
  remainingSec: number;
  startedAt?: string;   // ISO timestamp
  endedAt?: string;     // ISO timestamp
}

export interface BattleResult {
  battleId: string;
  winnerId: string | null;    // null = draw
  winnerUsername: string | null;
  loserId: string | null;
  loserUsername: string | null;
  isDraw: boolean;
  reason: BattleEndReason;
  player1EloChange: number;
  player2EloChange: number;
  player1NewRating: number;
  player2NewRating: number;
}

export type BattleEndReason =
  | "ACCEPTED"          // One player solved it
  | "BOTH_SUBMITTED"    // Both submitted, compare results
  | "TIME_UP"           // Timer ran out
  | "OPPONENT_LEFT"     // Opponent disconnected
  | "DRAW";             // Both failed equally
