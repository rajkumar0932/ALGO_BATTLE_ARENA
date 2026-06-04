import type { Socket, Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, SocketData, BattleRejoinPayload } from "@algobattle/types";
import { getBattleState, updateBattleState, deleteBattleState } from "../services/battleState";
import { prisma } from "@algobattle/db";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

// Active battle timers
const activeTimers = new Map<string, NodeJS.Timeout>();

export function registerBattleHandlers(io: TypedServer, socket: TypedSocket) {
  socket.on("battle:rejoin", async (payload: BattleRejoinPayload) => {
    const { battleId } = payload;
    socket.join(`battle:${battleId}`);
    
    const state = await getBattleState(battleId);
    if (!state) {
      socket.emit("battle:error", { code: "BATTLE_NOT_FOUND", message: "Battle not found or expired" });
      return;
    }

    // Start timer if not already running and phase is WAITING or IN_PROGRESS
    if (!activeTimers.has(battleId) && (state.phase === "WAITING" || state.phase === "IN_PROGRESS")) {
      startBattleTimer(io, battleId);
    }

    // Fetch problem details to send back to client
    const problem = await prisma.problem.findUnique({
      where: { id: state.problemId },
      include: {
        testCases: { where: { isHidden: false }, orderBy: { order: "asc" } }
      }
    });

    if (problem) {
      socket.emit("battle:start", {
        battle: state,
        starterCode: problem.starterCode,
        description: problem.description,
        visibleTestCases: problem.testCases.map(tc => ({
          input: tc.input,
          expected: tc.expected,
          order: tc.order
        }))
      });
    }
  });

  socket.on("battle:leave", (payload: { battleId: string }) => {
    socket.leave(`battle:${payload.battleId}`);
  });
}

export async function startBattleTimer(io: TypedServer, battleId: string) {
  if (activeTimers.has(battleId)) return;

  const state = await getBattleState(battleId);
  if (!state) return;

  // Mark as started if it was WAITING
  if (state.phase === "WAITING") {
    state.phase = "IN_PROGRESS";
    state.startedAt = new Date().toISOString();
    await updateBattleState(state);
    
    // Also update DB
    await prisma.battle.update({
      where: { id: battleId },
      data: { status: "IN_PROGRESS", startedAt: new Date() }
    });
  }

  const timerId = setInterval(async () => {
    const currentState = await getBattleState(battleId);
    if (!currentState || currentState.phase === "COMPLETED") {
      stopBattleTimer(battleId);
      return;
    }

    currentState.remainingSec -= 1;
    await updateBattleState(currentState);

    io.to(`battle:${battleId}`).emit("battle:tick", {
      battleId,
      remainingSec: currentState.remainingSec
    });

    if (currentState.remainingSec <= 0) {
      stopBattleTimer(battleId);
      await handleTimeUp(io, battleId, currentState);
    }
  }, 1000);

  activeTimers.set(battleId, timerId);
}

export function stopBattleTimer(battleId: string) {
  const timerId = activeTimers.get(battleId);
  if (timerId) {
    clearInterval(timerId);
    activeTimers.delete(battleId);
  }
}

async function handleTimeUp(io: TypedServer, battleId: string, state: any) {
  // Logic to end the battle due to timeout
  // This will be called if the timer reaches 0 before both users submit
  // Full implementation in submission.ts (endBattle helper)
}
