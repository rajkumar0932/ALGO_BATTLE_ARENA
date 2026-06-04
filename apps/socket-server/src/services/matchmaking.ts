import { randomUUID } from "crypto";
import { Server } from "socket.io";
import { prisma } from "@algobattle/db";
import type { LobbyJoinPayload, ClientToServerEvents, ServerToClientEvents } from "@algobattle/types";
import { createBattleState } from "./battleState";

interface QueueEntry extends LobbyJoinPayload {
  socketId: string;
  joinedAt: number;
}

// In-memory matchmaking queue
let queue: QueueEntry[] = [];
let matchmakingInterval: NodeJS.Timeout | null = null;

const ELO_TOLERANCE = 200;
const TIME_TO_EXPAND_TOLERANCE_MS = 15000; // 15 seconds

export function addToQueue(socketId: string, payload: LobbyJoinPayload) {
  // Prevent duplicate entries
  queue = queue.filter(q => q.userId !== payload.userId && q.socketId !== socketId);
  queue.push({ ...payload, socketId, joinedAt: Date.now() });
  console.log(`[Lobby] Added ${payload.username} to queue. Queue length: ${queue.length}`);
}

export function removeFromQueue(socketId: string) {
  queue = queue.filter(q => q.socketId !== socketId);
}

export function removeFromQueueByUserId(userId: string) {
  queue = queue.filter(q => q.userId !== userId);
}

export function startMatchmakingLoop(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  if (matchmakingInterval) return;

  matchmakingInterval = setInterval(async () => {
    if (queue.length < 2) return;

    // Sort by joinedAt to prioritize oldest entries
    queue.sort((a, b) => a.joinedAt - b.joinedAt);

    const unmatched: QueueEntry[] = [];
    
    // Process queue
    while (queue.length >= 2) {
      const p1 = queue.shift()!;
      let matchedIndex = -1;
      
      const p1WaitTime = Date.now() - p1.joinedAt;
      const currentTolerance = p1WaitTime > TIME_TO_EXPAND_TOLERANCE_MS ? Infinity : ELO_TOLERANCE;

      // Find suitable opponent
      for (let i = 0; i < queue.length; i++) {
        const p2 = queue[i];
        if (Math.abs(p1.rating - p2.rating) <= currentTolerance) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        // We have a match!
        const p2 = queue.splice(matchedIndex, 1)[0];
        await createMatch(io, p1, p2);
      } else {
        // No match found for p1 right now
        unmatched.push(p1);
      }
    }

    // Put unmatched back
    queue.push(...unmatched, ...queue);
  }, 2000); // Run every 2 seconds
}

async function createMatch(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  p1: QueueEntry,
  p2: QueueEntry
) {
  console.log(`[Matchmaking] Matched ${p1.username} vs ${p2.username}`);

  try {
    // 1. Pick a random problem (for MVP we pick from all available)
    const problems = await prisma.problem.findMany();
    if (problems.length === 0) throw new Error("No problems found in DB");
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    // 2. Create Battle in DB
    const battle = await prisma.battle.create({
      data: {
        player1Id: p1.userId,
        player2Id: p2.userId,
        problemId: randomProblem.id,
        status: "WAITING",
        timeLimitSec: 600, // 10 minutes
      }
    });

    // 3. Initialize Battle State in Redis
    await createBattleState({
      battleId: battle.id,
      phase: "WAITING",
      problemId: randomProblem.id,
      problemTitle: randomProblem.title,
      problemSlug: randomProblem.slug,
      timeLimitSec: 600,
      remainingSec: 600,
      player1: {
        userId: p1.userId,
        username: p1.username,
        rating: p1.rating,
        hasSubmitted: false,
      },
      player2: {
        userId: p2.userId,
        username: p2.username,
        rating: p2.rating,
        hasSubmitted: false,
      }
    });

    // 4. Notify both players
    io.to(p1.socketId).emit("lobby:matched", {
      battleId: battle.id,
      opponent: { userId: p2.userId, username: p2.username, rating: p2.rating },
      problemSlug: randomProblem.slug
    });

    io.to(p2.socketId).emit("lobby:matched", {
      battleId: battle.id,
      opponent: { userId: p1.userId, username: p1.username, rating: p1.rating },
      problemSlug: randomProblem.slug
    });

  } catch (error) {
    console.error("[Matchmaking] Error creating match:", error);
    // Put them back in queue
    queue.push(p1, p2);
  }
}
