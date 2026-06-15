import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middleware";

export function setupSocket(io: Server) {
    // 1. Register Auth Middleware
    io.use(socketAuthMiddleware);

    // 2. Listen for connections
    io.on("connection", (socket: Socket) => {
        console.log(`⚡ Authenticated WebSocket connection: ${socket.id} (User ID: ${socket.data.userId})`);

        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
}
