export interface BattleState {
  battleId: string;
  phase: "WAITING" | "ACTIVE" | "COMPLETED";
  problemId: string;
  problemTitle: string;
  remainingSec: number;
  player1: BattlePlayer;
  player2: BattlePlayer;
}

export interface BattlePlayer {
  userId: string;
  username: string;
  rating: number;
  hasSubmitted: boolean;
  verdict?: BattleVerdict;
  passedCases?: number;
  totalCases?: number;
  executionTimeMs?: number;
}

export type BattleVerdict =
  | "PENDING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

export interface SocketData {
  userId: string;
  username: string;
  rating: number;
}

export interface BattleResult {
  battleId: string;
  isDraw: boolean;
  winnerId?: string;
  winnerUsername?: string;
  reason: "ACCEPTED" | "BOTH_SUBMITTED" | "TIME_UP" | "OPPONENT_LEFT";
  player1EloChange: number;
  player2EloChange: number;
  player1NewRating: number;
  player2NewRating: number;
}
