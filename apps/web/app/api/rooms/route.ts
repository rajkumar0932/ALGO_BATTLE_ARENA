import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@algobattle/db";
import { generateRoomCode } from "@algobattle/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problemSelection, problemSlug, problemDifficulty, timeLimit, scoringMode, isRanked } =
      await request.json();

    // Resolve problem
    let problemId: string | null = null;
    if (problemSelection === "specific" && problemSlug) {
      const problem = await prisma.problem.findUnique({ where: { slug: problemSlug } });
      if (!problem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 });
      }
      problemId = problem.id;
    } else if (problemSelection === "by-difficulty" && problemDifficulty) {
      const problems = await prisma.problem.findMany({
        where: { difficulty: problemDifficulty },
      });
      if (problems.length > 0) {
        problemId = problems[Math.floor(Math.random() * problems.length)].id;
      }
    } else {
      // Random
      const problems = await prisma.problem.findMany();
      if (problems.length > 0) {
        problemId = problems[Math.floor(Math.random() * problems.length)].id;
      }
    }

    // Generate a unique room code
    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.privateRoom.findUnique({ where: { code } });
      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const room = await prisma.privateRoom.create({
      data: {
        code,
        hostId: session.user.id,
        problemId,
        timeLimit: timeLimit || 1800,
        scoringMode: scoringMode || "standard",
        isRanked: isRanked || false,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min TTL
      },
    });

    return NextResponse.json({ code: room.code, roomId: room.id }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
