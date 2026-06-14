import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Keep the connection alive to prevent Neon from sleeping/dropping connections
setInterval(async () => {
    try {
        await pool.query('SELECT 1');
    } catch (err) {
        console.error('Keep-alive ping failed', err);
    }
}, 4 * 60 * 1000); // ping every 4 minutes

console.log("Database Connected");