// ─── Room Types ─────────────────────────────────────────
// Types for private room battles

export type RoomScoringMode = "standard" | "first-to-solve" | "most-cases";

export interface RoomConfig {
  problemSelection: "random" | "by-difficulty" | "specific";
  problemSlug?: string;          // only if specific
  problemDifficulty?: "EASY" | "MEDIUM" | "HARD"; // only if by-difficulty
  timeLimit: number;             // seconds
  scoringMode: RoomScoringMode;
  isRanked: boolean;
}

export interface PrivateRoomState {
  code: string;
  hostId: string;
  hostUsername: string;
  hostRating: number;
  guestId?: string;
  guestUsername?: string;
  guestRating?: number;
  config: RoomConfig;
  status: "OPEN" | "FULL" | "STARTED" | "FINISHED" | "EXPIRED";
}

// Unambiguous characters only (no 0/O, 1/I/l confusion)
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  return Array.from({ length: 6 }, () =>
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  ).join("");
}
