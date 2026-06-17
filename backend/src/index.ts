import { pool } from "./config/db";
import { redisClient } from "./config/redis";
import app from "./app";
import http from "http";
import { Server } from "socket.io";

async function start() {
    try {
        try {
            const result = await pool.query("SELECT NOW()");
            console.log("Database Connected Successfully:", result.rows[0]);
        } catch (dbErr) {
            console.error("Database connection check failed, but continuing server start:", dbErr);
        }

        try {
            await redisClient.connect();
        } catch (redisErr) {
            console.error("Redis connection failed, continuing:", redisErr);
        }

        // 1. Create HTTP server wrapping your Express app
        const httpServer = http.createServer(app);

        // 2. Initialize Socket.IO attached to this HTTP server
        const allowedOrigins = process.env.ALLOWEDSITE?.split(',').map(s => s.trim()) || ["http://localhost:3002"];
        const io = new Server(httpServer, {
            cors: {
                origin: allowedOrigins,
                credentials: true,
            },
        });

        // 3. Import and run socket setup
        const { setupSocket } = await import("./socket");
        setupSocket(io);

        // 4. IMPORTANT: Call .listen() on the httpServer, NOT the app!
        httpServer.listen(4000, () => {
            console.log(`Server running on port 4000 (HTTP + WebSockets)`);
        });

    } catch (err) {
        console.error(err);
    }
}

start();
