import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@algobattle/db";
import { callGroq } from "@/lib/groq";
import { BOT_TIERS } from "@algobattle/types";
import type { BotTier } from "@algobattle/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problemSlug, tier } = await request.json() as { problemSlug: string; tier: BotTier };

    const tierConfig = BOT_TIERS.find((t) => t.tier === tier);
    if (!tierConfig) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Fetch problem
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      include: { testCases: { orderBy: { order: "asc" } } },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Check if bot tier can solve this difficulty
    const canSolve = tierConfig.canSolveDifficulties.includes(problem.difficulty);

    let solution = "";
    let botVerdict: "ACCEPTED" | "WRONG_ANSWER" = "WRONG_ANSWER";
    let botPassedCases = 0;

    if (canSolve) {
      // Ask Groq to generate a solution
      try {
        solution = await callGroq(
          [
            {
              role: "system",
              content: `You are a competitive programmer at ${tierConfig.label} level solving a coding problem.
Return ONLY a working JavaScript solution function. No explanation. No markdown. No code fences.
The function must match the starter code signature exactly.
The code should include everything needed — including the readline and console.log parts from the starter code.`,
            },
            {
              role: "user",
              content: `Problem: ${problem.description}\n\nStarter code:\n${problem.starterCode}`,
            },
          ],
          { temperature: tier === "grandmaster" ? 0.1 : tier === "beginner" ? 0.8 : 0.4 }
        );

        // Clean up the solution if it has markdown code fences
        solution = solution
          .replace(/^```\w*\n?/, "")
          .replace(/\n?```$/, "")
          .trim();

        // We assume the bot's solution is correct for the tiers that can solve it
        // In a real system we'd run it through the judge. For the MVP, we simulate.
        botVerdict = "ACCEPTED";
        botPassedCases = problem.testCases.length;
      } catch (e) {
        console.error("Groq bot solve error:", e);
        botVerdict = "WRONG_ANSWER";
      }
    }

    // Calculate simulated solve time
    const [minTime, maxTime] = tierConfig.solveTimeMinRange;
    const baseTimeMs = (minTime + Math.random() * (maxTime - minTime)) * 60 * 1000;
    // Apply ±20% jitter
    const jitter = 0.8 + Math.random() * 0.4;
    const simulatedTimeMs = Math.round(baseTimeMs * jitter);

    // Calculate wrong attempts
    const [minWrong, maxWrong] = tierConfig.wrongAttempts;
    const wrongAttempts = minWrong + Math.floor(Math.random() * (maxWrong - minWrong + 1));

    // If can't solve, bot fails after using full time
    if (!canSolve) {
      botPassedCases = Math.floor(Math.random() * Math.max(1, problem.testCases.length - 2));
    }

    // Create BotBattle record
    const botBattle = await prisma.botBattle.create({
      data: {
        userId: session.user.id,
        problemId: problem.id,
        botTier: tier,
        botElo: tierConfig.elo,
        botCode: solution || null,
        botVerdict,
        botPassedCases,
        botTotalCases: problem.testCases.length,
        botTimeTakenMs: simulatedTimeMs,
        timeLimitSec: 600,
      },
    });

    return NextResponse.json({
      botBattleId: botBattle.id,
      problemSlug: problem.slug,
      problemTitle: problem.title,
      problemDescription: problem.description,
      starterCode: problem.starterCode,
      visibleTestCases: problem.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({ input: tc.input, expected: tc.expected, order: tc.order })),
      botTier: tier,
      botElo: tierConfig.elo,
      simulatedTimeMs,
      wrongAttempts,
      botVerdict,
      botPassedCases,
      botTotalCases: problem.testCases.length,
    });
  } catch (error) {
    console.error("Bot solve error:", error);
    return NextResponse.json({ error: "Failed to initialize bot battle" }, { status: 500 });
  }
}
