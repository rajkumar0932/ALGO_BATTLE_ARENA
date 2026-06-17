import asynchr from "../util/asynchronous";
import { pool } from "../config/db";
import { Request, Response } from "express";
import { ApiResponse } from "../util/customresponse";
export const BattlePage = asynchr(async (req: Request, res: Response) => {
    // to get last 5 played matches 
    // user1, user 2, winner, played at time, 
    // 1 to many relation with problem 
    const query = `
    SELECT
    m.id,
    p1.name AS player1,
    p2.name AS player2,
    w.name AS winner,
    p.title AS problem,
    m.duration,
    m.played_at
FROM matches m
JOIN users p1 ON m.player1_id = p1.id
JOIN users p2 ON m.player2_id = p2.id
LEFT JOIN users w ON m.winner_id = w.id
LEFT JOIN problems p ON m.problem_id = p.id
ORDER BY m.played_at DESC
LIMIT 5;
    `
    const result = await pool.query(query);
    return res.status(200).json(new ApiResponse(200, result.rows, "Battle data given"))
});

