import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { SocketData } from "./types";
import { redisClient } from "../config/redis";

export function setupMatchmaking(io: Server, socket: Socket) {
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

                // 1. Notify OURSELVES (Player 2)
                socket.emit("lobby:matched", {
                    battleId,
                    opponent: opponentData.user,
                    problemSlug: "two-sum"
                });

                // 2. Notify the OPPONENT (Player 1) using their saved socketId
                io.to(opponentData.socketId).emit("lobby:matched", {
                    battleId,
                    opponent: payload,
                    problemSlug: "two-sum"
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
}
