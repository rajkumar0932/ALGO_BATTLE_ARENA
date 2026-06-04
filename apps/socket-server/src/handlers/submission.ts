import type { Socket, Server } from "socket.io";
import { prisma } from "@algobattle/db";
import { addJudgeJob } from "@algobattle/judge";
import { getBattleState, updateBattleState, deleteBattleState } from "../services/battleState";
import { calculateElo } from "../services/elo";
import { stopBattleTimer } from "./battle";
import type { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SocketData, 
  BattleSubmitPayload,
  JudgeResult,
  BattleResult,
  BattleVerdict
} from "@algobattle/types";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export function registerSubmissionHandlers(io: TypedServer, socket: TypedSocket) {
  socket.on("battle:submit", async (payload: BattleSubmitPayload) => {
    const { battleId, code, language = "javascript" } = payload;
    const userId = socket.data.userId;

    console.log(`[Submit] ${userId} submitted for battle ${battleId}`);

    const state = await getBattleState(battleId);
    if (!state || state.phase !== "IN_PROGRESS") {
      socket.emit("battle:error", { code: "BATTLE_NOT_ACTIVE", message: "Battle is not active" });
      return;
    }

    // 1. Create Submission in DB
    const submission = await prisma.submission.create({
      data: {
        code,
        language,
        userId,
        battleId,
        verdict: "PENDING"
      }
    });

    // 2. Acknowledge receipt to the submitter
    socket.emit("battle:submission_ack", {
      battleId,
      submissionId: submission.id,
      status: "JUDGING"
    });

    // 3. Notify opponent
    socket.to(`battle:${battleId}`).emit("battle:opponent_submitted", { battleId });

    // 4. Update BattleState to note this player has submitted
    let isP1 = state.player1.userId === userId;
    if (isP1) {
      state.player1.hasSubmitted = true;
      state.player1.submissionId = submission.id;
    } else if (state.player2.userId === userId) {
      state.player2.hasSubmitted = true;
      state.player2.submissionId = submission.id;
    }
    await updateBattleState(state);

    // 5. Enqueue to Judge
    await addJudgeJob({
      submissionId: submission.id,
      battleId,
      userId,
      code,
      language,
      problemId: state.problemId,
      timeLimitMs: 2000
    });
  });
}

// Called by the Redis subscriber in index.ts when judge finishes
export async function handleJudgeResult(io: TypedServer, result: JudgeResult) {
  const { battleId, submissionId, userId, verdict, passedCases, totalCases, executionTimeMs, error } = result;

  // 1. Send verdict to the specific user
  io.to(`battle:${battleId}`).emit("battle:submission_result", {
    battleId,
    submissionId,
    verdict,
    passedCases,
    totalCases,
    executionTimeMs,
    error
  });

  // Also emit specifically for opponent UI
  io.to(`battle:${battleId}`).emit("battle:opponent_verdict", { battleId, verdict });

  // 2. Check if battle should end
  const state = await getBattleState(battleId);
  if (!state || state.phase === "COMPLETED") return;

  const isP1 = state.player1.userId === userId;
  if (isP1) {
    state.player1.verdict = verdict;
    state.player1.passedCases = passedCases;
    state.player1.totalCases = totalCases;
    state.player1.executionTimeMs = executionTimeMs;
  } else {
    state.player2.verdict = verdict;
    state.player2.passedCases = passedCases;
    state.player2.totalCases = totalCases;
    state.player2.executionTimeMs = executionTimeMs;
  }
  
  await updateBattleState(state);

  // End conditions:
  // 1. This submission was ACCEPTED
  // 2. Both players have submitted and neither was ACCEPTED (we end it, whoever got more cases or faster wins, or draw)
  
  if (verdict === "ACCEPTED") {
    await endBattle(io, battleId, state, "ACCEPTED", isP1 ? state.player1.userId : state.player2.userId);
  } else if (state.player1.hasSubmitted && state.player2.hasSubmitted) {
    // Both submitted, neither accepted. Compare cases.
    let winnerId: string | null = null;
    let isDraw = false;

    const p1Cases = state.player1.passedCases || 0;
    const p2Cases = state.player2.passedCases || 0;

    if (p1Cases > p2Cases) {
      winnerId = state.player1.userId;
    } else if (p2Cases > p1Cases) {
      winnerId = state.player2.userId;
    } else {
      isDraw = true;
    }

    await endBattle(io, battleId, state, "BOTH_SUBMITTED", winnerId, isDraw);
  }
}

export async function endBattle(
  io: TypedServer, 
  battleId: string, 
  state: any, 
  reason: any, 
  winnerId: string | null, 
  isDraw: boolean = false
) {
  stopBattleTimer(battleId);
  state.phase = "COMPLETED";
  state.endedAt = new Date().toISOString();
  await updateBattleState(state);

  // Determine winner/loser
  let p1WinVal: 1 | 0 | 0.5 = isDraw ? 0.5 : (winnerId === state.player1.userId ? 1 : 0);
  
  // Calculate ELO
  const [newRating1, newRating2, delta1, delta2] = calculateElo(
    state.player1.rating,
    state.player2.rating,
    p1WinVal
  );

  // Update DB
  await prisma.$transaction([
    prisma.battle.update({
      where: { id: battleId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        winnerId: isDraw ? null : winnerId,
      }
    }),
    prisma.user.update({
      where: { id: state.player1.userId },
      data: {
        rating: newRating1,
        wins: { increment: p1WinVal === 1 ? 1 : 0 },
        losses: { increment: p1WinVal === 0 ? 1 : 0 },
        draws: { increment: p1WinVal === 0.5 ? 1 : 0 }
      }
    }),
    prisma.user.update({
      where: { id: state.player2.userId },
      data: {
        rating: newRating2,
        wins: { increment: p1WinVal === 0 ? 1 : 0 },
        losses: { increment: p1WinVal === 1 ? 1 : 0 },
        draws: { increment: p1WinVal === 0.5 ? 1 : 0 }
      }
    })
  ]);

  // Emit end event
  const result: BattleResult = {
    battleId,
    winnerId,
    winnerUsername: winnerId === state.player1.userId ? state.player1.username : (winnerId === state.player2.userId ? state.player2.username : null),
    loserId: winnerId === state.player1.userId ? state.player2.userId : (winnerId === state.player2.userId ? state.player1.userId : null),
    loserUsername: winnerId === state.player1.userId ? state.player2.username : (winnerId === state.player2.userId ? state.player1.username : null),
    isDraw,
    reason,
    player1EloChange: delta1,
    player2EloChange: delta2,
    player1NewRating: newRating1,
    player2NewRating: newRating2
  };

  io.to(`battle:${battleId}`).emit("battle:end", { result });
  
  // Cleanup Redis after a delay
  setTimeout(() => deleteBattleState(battleId), 60000);
}
