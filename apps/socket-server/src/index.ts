import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import type { ClientToServerEvents, ServerToClientEvents, SocketData, JudgeResult } from "@algobattle/types";

import { registerLobbyHandlers } from "./handlers/lobby";
import { registerBattleHandlers } from "./handlers/battle";
import { registerSubmissionHandlers, handleJudgeResult } from "./handlers/submission";
import { startMatchmakingLoop, removeFromQueue } from "./services/matchmaking";

const PORT = process.env.PORT || 3001;

// Setup HTTP and Socket.IO servers
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Setup Redis subscriber for Judge results
const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

subscriber.psubscribe("judge:result:*", (err) => {
  if (err) console.error("Failed to subscribe to judge results:", err);
  else console.log("📡 Subscribed to judge results via Redis");
});

subscriber.on("pmessage", (pattern, channel, message) => {
  try {
    const result: JudgeResult = JSON.parse(message);
    handleJudgeResult(io, result);
  } catch (error) {
    console.error("Error parsing judge result:", error);
  }
});

// Start matchmaking background loop
startMatchmakingLoop(io);

// Socket connections
io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  registerLobbyHandlers(socket);
  registerBattleHandlers(io, socket);
  registerSubmissionHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    removeFromQueue(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  subscriber.quit();
  io.close();
  process.exit(0);
});
