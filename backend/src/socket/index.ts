import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middleware";
import { setupMatchmaking } from "./matchmaking";
import { setupBattle } from "./battle";

export function setupSocket(io: Server) {
    // 1. Register Auth Middleware
    io.use(socketAuthMiddleware);

    // 2. Listen for connections
    io.on("connection", (socket: Socket) => {
        console.log(`⚡ Authenticated WebSocket connection: ${socket.id} (User ID: ${socket.data.userId})`);

        // Force socket to join a room matching their own userId.
        // This lets us do io.to(userId).emit(...) across multiple node instances
        socket.join(socket.data.userId);

        // Register socket controllers
        setupMatchmaking(io, socket);
        setupBattle(io, socket);

        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
}
