import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { SocketData } from "./types";
import { redisClient } from "../config/redis";
import { pool } from "../config/db";
import { createBattle } from "./battle";

export function setupMatchmaking(io: Server, socket: Socket) {
    // Store the payload locally so we have access to it when the socket disconnects
    // Store the payload locally so we have access to it when the socket disconnects
    let joinedPayload: SocketData | null = null;
    // When a user clicks "Find Battle"
    socket.on("lobby:join", async (payload: SocketData) => {
        joinedPayload = payload;
        try {
            console.log(`[Lobby Debug] User joined:`, payload);

            // Pop an opponent from the Redis list (the queue)
            const opponentRaw = await redisClient.lPop("matchmaking_queue");
            console.log(`[Lobby Debug] opponentRaw from Redis:`, opponentRaw);

            if (!opponentRaw) {
                // Queue was empty, so we add OURSELVES to the Redis queue
                const playerStr = JSON.stringify({ socketId: socket.id, user: payload });
                console.log(`[Lobby Debug] Queue empty, pushing:`, playerStr);
                await redisClient.rPush("matchmaking_queue", playerStr);

                socket.emit("lobby:searching", { message: "Looking for an opponent..." });
            } else {
                // We found an opponent in Redis!
                const opponentData = JSON.parse(opponentRaw);
                console.log(`[Lobby Debug] Found opponent:`, opponentData.user);

                // Don't match with yourself if you clicked twice
                if (String(opponentData.user.userId) === String(payload.userId)) {
                    console.log(`[Lobby Debug] Match aborted (same user). Pushing back to queue.`);
                    await redisClient.rPush("matchmaking_queue", opponentRaw);
                    socket.emit("lobby:searching", { message: "Looking for an opponent..." });
                    return;
                }

                // Generate a unique room/battle ID
                const battleId = uuidv4();

                console.log(`[Lobby] Match created: ${payload.username} vs ${opponentData.user.username}`);

                // Calculate average rating to pick difficulty
                const avgRating = (payload.rating + opponentData.user.rating) / 2;
                let difficulty = "easy";
                if (avgRating > 1500 && avgRating <= 1900) {
                    difficulty = "medium";
                } else if (avgRating > 1900) {
                    difficulty = "hard";
                }

                // Query DB for random problem of this difficulty
                let problemId = null;
                let problemTitle = "Unknown Problem";
                try {
                    const res = await pool.query(
                        `SELECT id, title FROM problems WHERE difficulty = $1 ORDER BY RANDOM() LIMIT 1`,
                        [difficulty]
                    );
                    if (res.rows.length > 0) {
                        problemId = res.rows[0].id;
                        problemTitle = res.rows[0].title;
                    } else {
                        // Fallback if no problem of that difficulty exists
                        const fallback = await pool.query(`SELECT id, title FROM problems ORDER BY RANDOM() LIMIT 1`);
                        if (fallback.rows.length > 0) {
                            problemId = fallback.rows[0].id;
                            problemTitle = fallback.rows[0].title;
                        }
                    }
                } catch (dbErr) {
                    console.error("DB Error selecting problem:", dbErr);
                }

                // Initialize Battle State for both users
                createBattle({
                    battleId,
                    phase: "ACTIVE",
                    problemId: problemId || "1",
                    problemTitle: problemTitle,
                    remainingSec: 60 * 15,
                    player1: {
                        userId: opponentData.user.userId,
                        username: opponentData.user.username,
                        rating: opponentData.user.rating,
                        hasSubmitted: false
                    },
                    player2: {
                        userId: payload.userId,
                        username: payload.username,
                        rating: payload.rating,
                        hasSubmitted: false
                    }
                });

                // 1. Notify OURSELVES (Player 2)
                socket.emit("lobby:matched", {
                    battleId,
                    opponent: opponentData.user,
                    problemId
                });

                // 2. Notify the OPPONENT (Player 1) using their saved socketId
                io.to(opponentData.socketId).emit("lobby:matched", {
                    battleId,
                    opponent: payload,
                    problemId
                });
            }
        } catch (err) {
            console.error("Redis Matchmaking Error:", err);
        }
    });

    // When a user cancels the search or disconnects
    const handleLeave = async () => {
        try {
            if (!joinedPayload) return; // User was never in the queue

            console.log(`[Lobby] Socket ${socket.id} leaving queue.`);

            // Reconstruct the exact string we pushed and ask Redis to remove it
            const playerStr = JSON.stringify({ socketId: socket.id, user: joinedPayload });
            await redisClient.lRem("matchmaking_queue", 0, playerStr);

            console.log(`[Lobby] Successfully removed ${joinedPayload.username} from Redis queue.`);

            // Clear the local payload
            joinedPayload = null;
        } catch (err) {
            console.error("Error leaving Redis queue:", err);
        }
    };

    socket.on("lobby:leave", handleLeave);
    socket.on("disconnect", handleLeave);

    // ==========================================
    // PRIVATE ROOM MATCHMAKING
    // ==========================================

    socket.on("room:create", async (payload: SocketData) => {
        try {
            // Generate a UUID room code
            const code = uuidv4();
            
            // Store host in Redis (expire in 1 hour)
            await redisClient.setEx(`room:${code}`, 3600, JSON.stringify({ socketId: socket.id, user: payload }));
            
            console.log(`[Room] ${payload.username} created room ${code}`);
            socket.emit("room:created", { code });
        } catch (err) {
            console.error("Redis Room Create Error:", err);
            socket.emit("room:error", { message: "Failed to create room." });
        }
    });

    socket.on("room:join", async (payload: SocketData, code: string) => {
        try {
            const roomCode = code.toLowerCase();
            const hostRaw = await redisClient.get(`room:${roomCode}`);
            
            if (!hostRaw) {
                socket.emit("room:error", { message: "Room not found or expired." });
                return;
            }

            const hostData = JSON.parse(hostRaw);
            
            // Prevent joining own room
            if (String(hostData.user.userId) === String(payload.userId)) {
                socket.emit("room:error", { message: "You cannot join your own room." });
                return;
            }

            // Room found, delete it so no one else joins
            await redisClient.del(`room:${roomCode}`);
            
            console.log(`[Room] Match created in ${roomCode}: ${hostData.user.username} vs ${payload.username}`);

            // Generate unique battle ID
            const battleId = uuidv4();

            // Query DB for random problem
            let problemId = null;
            let problemTitle = "Unknown Problem";
            try {
                const res = await pool.query(`SELECT id, title FROM problems ORDER BY RANDOM() LIMIT 1`);
                if (res.rows.length > 0) {
                    problemId = res.rows[0].id;
                    problemTitle = res.rows[0].title;
                }
            } catch (dbErr) {
                console.error("DB Error selecting problem for private room:", dbErr);
            }

            // Initialize Battle State for both users
            createBattle({
                battleId,
                phase: "ACTIVE",
                problemId: problemId || "1",
                problemTitle: problemTitle,
                remainingSec: 60 * 15,
                player1: {
                    userId: hostData.user.userId,
                    username: hostData.user.username,
                    rating: hostData.user.rating,
                    hasSubmitted: false
                },
                player2: {
                    userId: payload.userId,
                    username: payload.username,
                    rating: payload.rating,
                    hasSubmitted: false
                }
            });

            // 1. Notify GUEST (Player 2)
            socket.emit("lobby:matched", {
                battleId,
                opponent: hostData.user,
                problemId
            });

            // 2. Notify HOST (Player 1)
            io.to(hostData.socketId).emit("lobby:matched", {
                battleId,
                opponent: payload,
                problemId
            });

        } catch (err) {
            console.error("Redis Room Join Error:", err);
            socket.emit("room:error", { message: "Failed to join room." });
        }
    });

    socket.on("room:leave", async (code: string) => {
        if (!code) return;
        try {
            await redisClient.del(`room:${code.toLowerCase()}`);
            console.log(`[Room] Host left, deleted room ${code}`);
        } catch (err) {
            console.error("Error leaving room:", err);
        }
    });
}
