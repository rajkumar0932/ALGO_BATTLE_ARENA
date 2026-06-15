import { Server, Socket } from "socket.io";
import { BattleState, BattleResult, BattleVerdict } from "./types";

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
    socket.on("battle:submit", (payload: { battleId: string, code: string, language: string }) => {
        const { battleId } = payload;
        console.log(`[Battle ${battleId}] User ${socket.data.userId} submitted code.`);

        // 1. Tell both players someone submitted (to show "Judging...")
        io.emit("battle:opponent_submitted", { battleId });

        // 2. Mock code evaluation (wait 3 seconds)
        setTimeout(() => {
            const verdict: BattleVerdict = "ACCEPTED";

            // Send success result back to submitter
            socket.emit("battle:submission_result", {
                battleId,
                submissionId: "sub_123",
                verdict,
                passedCases: 3,
                totalCases: 3,
                executionTimeMs: 45
            });

            // Tell the opponent what the verdict was
            socket.broadcast.emit("battle:opponent_verdict", {
                battleId,
                verdict
            });

            // End the battle since someone got it right!
            io.emit("battle:end", {
                result: {
                    battleId,
                    isDraw: false,
                    winnerId: socket.data.userId,
                    winnerUsername: "Player",
                    reason: "ACCEPTED",
                    player1EloChange: +15,
                    player2EloChange: -15,
                    player1NewRating: 1215,
                    player2NewRating: 1185
                }
            });

            // Stop the timer
            if (battleTimers.has(battleId)) {
                clearInterval(battleTimers.get(battleId)!);
                battleTimers.delete(battleId);
            }
        }, 3000);
    });
}
