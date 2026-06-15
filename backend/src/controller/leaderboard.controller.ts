import asyncHandler from "../util/asynchronous";
import { pool } from "../config/db";
import { Request, Response } from "express";

export const GetLeaderBoard = asyncHandler(
    async (req: Request, res: Response) => {

        const type = req.query.type;
        // type = "today" | "week" | "all"

        let leaderboardResult;

        // -----------------------------
        // TODAY
        // -----------------------------
        if (type === "today") {

            leaderboardResult = await pool.query(`
                WITH combinerow AS (
                    SELECT
                        u.id,
                        u.name AS username,
                        v.elo_rating AS userrating,

                        (
                            SELECT COUNT(*)
                            FROM matches m
                            WHERE m.winner_id = u.id
                              AND m.played_at >= CURRENT_DATE
                        ) AS won_match,

                        (
                            SELECT COUNT(*)
                            FROM matches m
                            WHERE (m.player1_id = u.id OR m.player2_id = u.id)
                              AND m.played_at >= CURRENT_DATE
                        ) AS matches

                    FROM users u
                    JOIN user_profiles v
                        ON u.id = v.user_id
                )

                SELECT
                    id,
                    username,
                    userrating,
                    ROUND((won_match::NUMERIC / NULLIF(matches, 0)) * 100, 2) AS winrate,
                    won_match || '-' || (matches - won_match) AS record
                FROM combinerow
                ORDER BY userrating DESC, winrate DESC;
            `);

        }

        // -----------------------------
        // THIS WEEK
        // -----------------------------
        else if (type === "week") {

            leaderboardResult = await pool.query(`
                WITH combinerow AS (
                    SELECT
                        u.id,
                        u.name AS username,
                        v.elo_rating AS userrating,

                        (
                            SELECT COUNT(*)
                            FROM matches m
                            WHERE m.winner_id = u.id
                              AND m.played_at >= date_trunc('week', NOW())
                        ) AS won_match,

                        (
                            SELECT COUNT(*)
                            FROM matches m
                            WHERE (m.player1_id = u.id OR m.player2_id = u.id)
                              AND m.played_at >= date_trunc('week', NOW())
                        ) AS matches

                    FROM users u
                    JOIN user_profiles v
                        ON u.id = v.user_id
                )

                SELECT
                    id,
                    username,
                    userrating,
                    ROUND((won_match::NUMERIC / NULLIF(matches, 0)) * 100, 2) AS winrate,
                    won_match || '-' || (matches - won_match) AS record
                FROM combinerow
                ORDER BY userrating DESC, winrate DESC;
            `);

        }

        // -----------------------------
        // ALL TIME
        // -----------------------------
        else {

            leaderboardResult = await pool.query(`
                SELECT
                    u.id,
                    u.name AS username,
                    v.elo_rating AS userrating,

                    ROUND(
                        (v.match_won::NUMERIC / NULLIF(v.battle_played, 0)) * 100,
                        2
                    ) AS winrate,

                    v.match_won || '-' ||
                    (v.battle_played - v.match_won) AS record

                FROM users u
                JOIN user_profiles v
                    ON u.id = v.user_id

                ORDER BY userrating DESC, winrate DESC;
            `);
        }

        return res.status(200).json({
            success: true,
            count: leaderboardResult.rowCount,
            data: leaderboardResult.rows
        });
    }
);