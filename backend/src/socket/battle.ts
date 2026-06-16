import { Server, Socket } from "socket.io";
import { BattleState, BattleResult, BattleVerdict } from "./types";
import { evaluateSubmission } from "../services/judge";

// In-memory store for active battles and their timers
const activeBattles: Map<string, BattleState> = new Map();
const battleTimers: Map<string, NodeJS.Timeout> = new Map();

export function setupBattle(io: Server, socket: Socket) {

    // When the frontend loads the battle page, it asks to rejoin/start
    socket.on("battle:rejoin", (payload: { battleId: string }) => {
        const { battleId } = payload;

        console.log(`[Battle ${battleId}] User ${socket.data.userId} joined the room`);

        // Mock a battle state if it doesn't exist yet
        if (!activeBattles.has(battleId)) {
            const newBattle: BattleState = {
                battleId,
                phase: "ACTIVE",
                problemId: "1",
                problemTitle: "Two Sum",
                remainingSec: 60 * 15, // 15 minutes
                player1: {
                    userId: socket.data.userId, // This is you
                    username: "Player 1",
                    rating: 1200,
                    hasSubmitted: false
                },
                player2: {
                    userId: "opponent-id", // Mock opponent
                    username: "Opponent",
                    rating: 1200,
                    hasSubmitted: false
                }
            };
            activeBattles.set(battleId, newBattle);
        }

        const battle = activeBattles.get(battleId)!;

        // Send the problem data to the frontend so it can render the editor
        socket.emit("battle:start", {
            battle,
            starterCode: "function twoSum(nums, target) {\n  // Write your code here\n}",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
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
                io.emit("battle:tick", { battleId, remainingSec: b.remainingSec });

                if (b.remainingSec <= 0) {
                    clearInterval(interval);
                    b.phase = "COMPLETED";
                    io.emit("battle:end", {
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

        // 1. Tell both players someone submitted (to show "Judging...")
        io.emit("battle:opponent_submitted", { battleId });

        // 2. Real Code Evaluation using Piston API!
        const result = await evaluateSubmission(payload.code, "javascript", "two-sum");

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
        socket.broadcast.emit("battle:opponent_verdict", {
            battleId,
            verdict: result.verdict
        });

        // If they got it right, end the battle!
        if (result.verdict === "ACCEPTED") {
            io.emit("battle:end", {
                result: {
                    battleId,
                    isDraw: false,
                    winnerId: socket.data.userId,
                    winnerUsername: payload.username || "Player",
                    reason: "ACCEPTED",
                    player1EloChange: +15,
                    player2EloChange: -15,
                    player1NewRating: 1215,
                    player2NewRating: 1185
                }
            });

            // Stop the countdown timer!
            if (battleTimers.has(battleId)) {
                clearInterval(battleTimers.get(battleId)!);
                battleTimers.delete(battleId);
            }
        }
    });

}
