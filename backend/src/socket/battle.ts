import { Server, Socket } from "socket.io";
import { BattleState, BattleResult, BattleVerdict } from "./types";
import { evaluateSubmission } from "../services/judge";

// In-memory store for active battles and their timers
export const activeBattles: Map<string, BattleState> = new Map();
export const battleTimers: Map<string, NodeJS.Timeout> = new Map();
export const disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

export function createBattle(battle: BattleState) {
    activeBattles.set(battle.battleId, battle);
}

export function setupBattle(io: Server, socket: Socket) {
    let currentBattleId: string | null = null;

    // When the frontend loads the battle page, it asks to rejoin/start
    socket.on("battle:rejoin", async (payload: { battleId: string }) => {
        const { battleId } = payload;
        currentBattleId = battleId;
        socket.join(battleId);

        // Clear any running disconnect timers for this user since they reconnected
        const timerKey = `${battleId}_${socket.data.userId}`;
        if (disconnectTimers.has(timerKey)) {
            clearTimeout(disconnectTimers.get(timerKey)!);
            disconnectTimers.delete(timerKey);
            console.log(`[Battle ${battleId}] User ${socket.data.userId} reconnected. Disconnect timer cleared.`);
        }

        console.log(`[Battle ${battleId}] User ${socket.data.userId} joined the room`);

        // Get the battle state initialized by matchmaking
        const battle = activeBattles.get(battleId);
        
        if (!battle) {
            console.error(`[Battle ${battleId}] Error: Battle not found in activeBattles map`);
            return;
        }

        // Fetch problem details from DB
        let statement = "Problem description not found.";
        let starterCode = "function solve() {\n  // Write code here\n}";
        try {
            const { pool } = require("../config/db");
            const res = await pool.query(
                `SELECT statement, starter_code FROM problems WHERE id = $1`,
                [battle.problemId]
            );
            if (res.rows.length > 0) {
                statement = res.rows[0].statement;
                // For MVP, extract Javascript starter code if it's a JSON object
                const codeJson = res.rows[0].starter_code;
                if (codeJson && codeJson.javascript) {
                    starterCode = codeJson.javascript;
                }
            }
        } catch (dbErr) {
            console.error(`[Battle ${battleId}] DB Error fetching problem details:`, dbErr);
        }

        // Send the problem data to the frontend so it can render the editor
        socket.emit("battle:start", {
            battle,
            starterCode: starterCode,
            description: statement,
            visibleTestCases: []
        });

        // Start the global countdown timer for this battle (if not running)
        if (!battleTimers.has(battleId)) {
            const interval = setInterval(() => {
                const b = activeBattles.get(battleId);
                if (!b) {
                    clearInterval(interval);
                    return;
                }

                b.remainingSec--;
                // Broadcast timer update to everyone in the battle
                io.to(battleId).emit("battle:tick", { battleId, remainingSec: b.remainingSec });

                if (b.remainingSec <= 0) {
                    clearInterval(interval);
                    b.phase = "COMPLETED";
                    io.to(battleId).emit("battle:end", {
                        result: {
                            battleId,
                            isDraw: true,
                            reason: "TIME_UP",
                            player1EloChange: 0,
                            player2EloChange: 0,
                            player1NewRating: b.player1.rating,
                            player2NewRating: b.player2.rating
                        }
                    });
                }
            }, 1000);
            battleTimers.set(battleId, interval);
        }
    });

    // When a user hits the "Submit" button
    // When a user hits the "Submit" button
    socket.on("battle:submit", async (payload: { battleId: string, code: string, language: string, username?: string }) => {
        const { battleId } = payload;
        console.log(`[Battle ${battleId}] User ${socket.data.userId} submitted code.`);

        const battle = activeBattles.get(battleId);
        if (!battle) {
            console.error(`[Battle ${battleId}] Error: Battle not found during submit.`);
            return;
        }

        // 1. Tell both players someone submitted (to show "Judging...")
        io.to(battleId).emit("battle:opponent_submitted", { battleId });

        // 2. Real Code Evaluation using Piston API!
        const result = await evaluateSubmission(payload.code, "javascript", battle.problemId);

        console.log(`[Battle ${battleId}] Judge Verdict: ${result.verdict} in ${result.executionTimeMs}ms`);

        // Send the result strictly back to the person who submitted
        socket.emit("battle:submission_result", {
            battleId,
            submissionId: "sub_" + Math.random().toString(36).substr(2, 9),
            verdict: result.verdict,
            passedCases: result.passedCases,
            totalCases: result.totalCases,
            executionTimeMs: result.executionTimeMs
        });

        // Tell the opponent what the verdict was
        socket.to(battleId).emit("battle:opponent_verdict", {
            battleId,
            verdict: result.verdict
        });

        // If they got it right, end the battle!
        if (result.verdict === "ACCEPTED") {
            const isP1Winner = String(socket.data.userId) === String(battle.player1.userId);
            const winner = isP1Winner ? battle.player1 : battle.player2;
            const loser = isP1Winner ? battle.player2 : battle.player1;

            const diff = Math.abs(winner.rating - loser.rating);
            const cappedDiff = Math.min(diff, 3000); // "till 3000"
            const eloChange = 20 + Math.floor(Math.max(0, cappedDiff - 1) / 50) * 10;

            const p1NewRating = battle.player1.rating + (isP1Winner ? eloChange : -eloChange);
            const p2NewRating = battle.player2.rating + (isP1Winner ? -eloChange : eloChange);

            io.to(battleId).emit("battle:end", {
                result: {
                    battleId,
                    isDraw: false,
                    winnerId: socket.data.userId,
                    winnerUsername: payload.username || winner.username,
                    reason: "ACCEPTED",
                    player1EloChange: isP1Winner ? eloChange : -eloChange,
                    player2EloChange: isP1Winner ? -eloChange : eloChange,
                    player1NewRating: p1NewRating,
                    player2NewRating: p2NewRating
                }
            });

            // Update Database with new Elo and stats
            try {
                const { pool } = require("../config/db");
                
                // Update Winner
                await pool.query(
                    `UPDATE user_profiles SET elo_rating = $1, battle_played = battle_played + 1, match_won = match_won + 1 WHERE user_id = $2`,
                    [isP1Winner ? p1NewRating : p2NewRating, winner.userId]
                );

                // Update Loser
                await pool.query(
                    `UPDATE user_profiles SET elo_rating = $1, battle_played = battle_played + 1 WHERE user_id = $2`,
                    [isP1Winner ? p2NewRating : p1NewRating, loser.userId]
                );
                
                console.log(`[Battle ${battleId}] Database updated with new Elo ratings`);
            } catch (dbErr) {
                console.error(`[Battle ${battleId}] Failed to update Elo in DB:`, dbErr);
            }

            // Stop the countdown timer!
            if (battleTimers.has(battleId)) {
                clearInterval(battleTimers.get(battleId)!);
                battleTimers.delete(battleId);
            }
        }
    });

    const handleDisconnectOrLeave = () => {
        if (!currentBattleId) return;
        const battleId = currentBattleId;
        const battle = activeBattles.get(battleId);
        
        // If battle doesn't exist or is already completed, do nothing
        if (!battle || battle.phase === "COMPLETED") return;

        const userId = socket.data.userId;
        const timerKey = `${battleId}_${userId}`;

        // Don't start another timer if one is already running
        if (disconnectTimers.has(timerKey)) return;

        console.log(`[Battle ${battleId}] User ${userId} disconnected/left. Starting 10s forfeit timer...`);

        const timerId = setTimeout(async () => {
            const b = activeBattles.get(battleId);
            // Verify battle is still active
            if (!b || b.phase === "COMPLETED") return;

            console.log(`[Battle ${battleId}] User ${userId} did not return within 10s. Forfeiting match.`);
            b.phase = "COMPLETED";

            const isP1Disconnected = String(userId) === String(b.player1.userId);
            const winner = isP1Disconnected ? b.player2 : b.player1;
            const loser = isP1Disconnected ? b.player1 : b.player2;

            const diff = Math.abs(winner.rating - loser.rating);
            const cappedDiff = Math.min(diff, 3000);
            const eloChange = 20 + Math.floor(Math.max(0, cappedDiff - 1) / 50) * 10;

            const p1NewRating = b.player1.rating + (isP1Disconnected ? -eloChange : eloChange);
            const p2NewRating = b.player2.rating + (isP1Disconnected ? eloChange : -eloChange);

            io.to(battleId).emit("battle:end", {
                result: {
                    battleId,
                    isDraw: false,
                    winnerId: winner.userId,
                    winnerUsername: winner.username,
                    reason: "OPPONENT_DISCONNECTED",
                    player1EloChange: isP1Disconnected ? -eloChange : eloChange,
                    player2EloChange: isP1Disconnected ? eloChange : -eloChange,
                    player1NewRating: p1NewRating,
                    player2NewRating: p2NewRating
                }
            });

            try {
                const { pool } = require("../config/db");
                
                // Update Winner
                await pool.query(
                    `UPDATE user_profiles SET elo_rating = $1, battle_played = battle_played + 1, match_won = match_won + 1 WHERE user_id = $2`,
                    [isP1Disconnected ? p2NewRating : p1NewRating, winner.userId]
                );

                // Update Loser
                await pool.query(
                    `UPDATE user_profiles SET elo_rating = $1, battle_played = battle_played + 1 WHERE user_id = $2`,
                    [isP1Disconnected ? p1NewRating : p2NewRating, loser.userId]
                );
            } catch (dbErr) {
                console.error(`[Battle ${battleId}] Failed to update DB on disconnect forfeit:`, dbErr);
            }

            if (battleTimers.has(battleId)) {
                clearInterval(battleTimers.get(battleId)!);
                battleTimers.delete(battleId);
            }
            disconnectTimers.delete(timerKey);
        }, 10000); // 10 seconds

        disconnectTimers.set(timerKey, timerId);
    };

    socket.on("disconnect", handleDisconnectOrLeave);
    socket.on("battle:leave", handleDisconnectOrLeave);
}
