import express from "express";
import { pool } from "./config/db";

const app = express();

async function start() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("Database Connected");
        console.log(result.rows[0]);

        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    } catch (err) {
        console.error(err);
    }
}

start();