import { NextResponse } from "next/server";
import { prisma } from "@algobattle/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { battleId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const battle = await prisma.battle.findUnique({
      where: { id: params.battleId },
      include: {
        problem: {
          include: {
            interviews: true,
            testCases: { where: { isHidden: false }, orderBy: { order: "asc" } },
          },
        },
        player1: { select: { id: true, username: true, rating: true } },
        player2: { select: { id: true, username: true, rating: true } },
        submissions: {
          include: { user: { select: { username: true } } },
          orderBy: { submittedAt: "asc" },
        },
      },
    });

    if (!battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    // Get the current user's submission
    const mySubmission = battle.submissions.find((s) => s.userId === session.user.id);
    const opponentSubmission = battle.submissions.find((s) => s.userId !== session.user.id);

    // Compute problem stats (percentile data)
    const allSubmissionsForProblem = await prisma.submission.findMany({
      where: {
        battle: { problemId: battle.problemId, status: "COMPLETED" },
      },
      select: {
        verdict: true,
        executionTimeMs: true,
        userId: true,
      },
    });

    const totalAttempts = allSubmissionsForProblem.length;
    const solvedSubmissions = allSubmissionsForProblem.filter((s) => s.verdict === "ACCEPTED");
    const solveRate = totalAttempts > 0 ? (solvedSubmissions.length / totalAttempts) * 100 : 0;

    const solveTimes = solvedSubmissions
      .filter((s) => s.executionTimeMs !== null)
      .map((s) => s.executionTimeMs!);
    const avgSolveTimeMs = solveTimes.length > 0
      ? solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length
      : 0;

    // How many users solved it faster than current user
    const userTimeMs = mySubmission?.executionTimeMs || 0;
    const fasterCount = solveTimes.filter((t) => t > userTimeMs).length;
    const fasterThanPercent = solveTimes.length > 0
      ? (fasterCount / solveTimes.length) * 100
      : 0;

    // First attempt rate: count distinct users, see how many had their first submission as ACCEPTED
    const userFirstSubmissions = new Map<string, string>();
    for (const s of allSubmissionsForProblem) {
      if (!userFirstSubmissions.has(s.userId)) {
        userFirstSubmissions.set(s.userId, s.verdict);
      }
    }
    const firstAttemptSolves = Array.from(userFirstSubmissions.values()).filter(
      (v) => v === "ACCEPTED"
    ).length;
    const firstAttemptRate = userFirstSubmissions.size > 0
      ? (firstAttemptSolves / userFirstSubmissions.size) * 100
      : 0;

    // Get similar problems (same tags, different problem)
    const similarProblems = await prisma.problem.findMany({
      where: {
        id: { not: battle.problemId },
        tags: { hasSome: battle.problem.tags },
      },
      select: {
        title: true,
        slug: true,
        difficulty: true,
        tags: true,
      },
      take: 3,
    });

    // Interview sightings
    const interviews = battle.problem.interviews;
    const companies = [...new Set(interviews.map((i) => i.company))];
    const totalInterviews = interviews.reduce((sum, i) => sum + i.frequency, 0);

    return NextResponse.json({
      battle: {
        id: battle.id,
        status: battle.status,
        winnerId: battle.winnerId,
        startedAt: battle.startedAt,
        endedAt: battle.endedAt,
        timeLimitSec: battle.timeLimitSec,
      },
      problem: {
        id: battle.problem.id,
        title: battle.problem.title,
        slug: battle.problem.slug,
        difficulty: battle.problem.difficulty,
        description: battle.problem.description,
        starterCode: battle.problem.starterCode,
        tags: battle.problem.tags,
      },
      players: {
        player1: battle.player1,
        player2: battle.player2,
      },
      mySubmission: mySubmission
        ? {
            id: mySubmission.id,
            code: mySubmission.code,
            verdict: mySubmission.verdict,
            passedCases: mySubmission.passedCases,
            totalCases: mySubmission.totalCases,
            executionTimeMs: mySubmission.executionTimeMs,
            submittedAt: mySubmission.submittedAt,
          }
        : null,
      opponentSubmission: opponentSubmission
        ? {
            verdict: opponentSubmission.verdict,
            passedCases: opponentSubmission.passedCases,
            totalCases: opponentSubmission.totalCases,
            executionTimeMs: opponentSubmission.executionTimeMs,
            username: opponentSubmission.user.username,
          }
        : null,
      stats: {
        solveRate: Math.round(solveRate * 10) / 10,
        avgSolveTimeMs: Math.round(avgSolveTimeMs),
        userTimeMs,
        fasterThanPercent: Math.round(fasterThanPercent * 10) / 10,
        totalAttempts,
        firstAttemptRate: Math.round(firstAttemptRate * 10) / 10,
      },
      interviewIntelligence: {
        companies,
        totalInterviews,
        sightings: interviews.map((i) => ({
          company: i.company,
          role: i.role,
          round: i.round,
          frequency: i.frequency,
          year: i.year,
          source: i.source,
        })),
      },
      similarProblems,
    });
  } catch (error) {
    console.error("Review data error:", error);
    return NextResponse.json({ error: "Failed to load review data" }, { status: 500 });
  }
}
