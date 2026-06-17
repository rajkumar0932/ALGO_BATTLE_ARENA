// ─── Socket.IO Event Types ───────────────────────────────
// Fully typed contract between client and server

import type { BattleState, BattleResult, BattleVerdict } from "./battle";

// ─── Payloads ────────────────────────────────────────────

/** Sent when a user joins the matchmaking lobby */
export interface LobbyJoinPayload {
  userId: string;
  username: string;
  rating: number;
}

/** Sent when two players are matched */
export interface LobbyMatchedPayload {
  battleId: string;
  opponent: {
    userId: string;
    username: string;
    rating: number;
  };
  problemSlug: string;
}

/** Sent when battle starts (both players connected to room) */
export interface BattleStartPayload {
  battle: BattleState;
  starterCode: string;
  description: string;
  visibleTestCases: Array<{
    input: string;
    expected: string;
    order: number;
  }>;
}

/** Sent every second during an active battle */
export interface BattleTickPayload {
  battleId: string;
  remainingSec: number;
}

/** Client submits their code */
export interface BattleSubmitPayload {
  battleId: string;
  code: string;
  language: string;
}

/** Server confirms submission was received and is being judged */
export interface BattleSubmissionAckPayload {
  battleId: string;
  submissionId: string;
  status: "JUDGING";
}

/** Server sends judge result to the submitter */
export interface BattleSubmissionResultPayload {
  battleId: string;
  submissionId: string;
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
  executionTimeMs: number;
  error?: string;
}

/** Sent to the opponent when other player submits */
export interface BattleOpponentSubmittedPayload {
  battleId: string;
  /** We don't expose opponent's verdict until battle ends */
}

/** Sent to the opponent when other player's verdict is ready */
export interface BattleOpponentVerdictPayload {
  battleId: string;
  verdict: BattleVerdict;
}

/** Sent when the battle ends */
export interface BattleEndPayload {
  result: BattleResult;
}

/** Sent when attempting to rejoin an in-progress battle */
export interface BattleRejoinPayload {
  battleId: string;
}

/** Error payload for any error events */
export interface SocketErrorPayload {
  code: string;
  message: string;
}

// ─── Event Maps ──────────────────────────────────────────

/** Events the CLIENT sends to the SERVER */
export interface ClientToServerEvents {
  "lobby:join": (payload: LobbyJoinPayload) => void;
  "lobby:leave": () => void;

  "battle:submit": (payload: BattleSubmitPayload) => void;
  "battle:leave": (payload: { battleId: string }) => void;
  "battle:rejoin": (payload: BattleRejoinPayload) => void;

  "room:create": (payload: LobbyJoinPayload) => void;
  "room:join": (payload: LobbyJoinPayload, code: string) => void;
  "room:leave": (code: string) => void;
}

/** Events the SERVER sends to the CLIENT */
export interface ServerToClientEvents {
  "lobby:matched": (payload: LobbyMatchedPayload) => void;
  "lobby:searching": (payload: { message: string }) => void;
  "lobby:error": (payload: SocketErrorPayload) => void;

  "battle:start": (payload: BattleStartPayload) => void;
  "battle:tick": (payload: BattleTickPayload) => void;
  "battle:submission_ack": (payload: BattleSubmissionAckPayload) => void;
  "battle:submission_result": (payload: BattleSubmissionResultPayload) => void;
  "battle:opponent_submitted": (payload: BattleOpponentSubmittedPayload) => void;
  "battle:opponent_verdict": (payload: BattleOpponentVerdictPayload) => void;
  "battle:end": (payload: BattleEndPayload) => void;
  "battle:error": (payload: SocketErrorPayload) => void;

  "room:created": (payload: { code: string }) => void;
  "room:error": (payload: { message: string }) => void;
}

/** Inter-server events (not used for client, but typed for completeness) */
export interface InterServerEvents {
  ping: () => void;
}

/** Per-socket data stored on the server side */
export interface SocketData {
  userId: string;
  username: string;
  rating: number;
}
