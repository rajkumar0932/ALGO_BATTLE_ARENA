import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@algobattle/db";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const room = await prisma.privateRoom.findUnique({
      where: { code: params.code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status === "EXPIRED" || room.expiresAt < new Date()) {
      return NextResponse.json({ error: "Room has expired" }, { status: 410 });
    }

    // Look up host username
    const host = await prisma.user.findUnique({
      where: { id: room.hostId },
      select: { username: true, rating: true },
    });

    return NextResponse.json({
      code: room.code,
      status: room.status,
      hostUsername: host?.username,
      hostRating: host?.rating,
      timeLimit: room.timeLimit,
      scoringMode: room.scoringMode,
      isRanked: room.isRanked,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.privateRoom.findUnique({
      where: { code: params.code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "OPEN") {
      return NextResponse.json({ error: "Room is not open for joining" }, { status: 400 });
    }

    if (room.expiresAt < new Date()) {
      await prisma.privateRoom.update({
        where: { id: room.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "Room has expired" }, { status: 410 });
    }

    if (room.hostId === session.user.id) {
      return NextResponse.json({ error: "Cannot join your own room" }, { status: 400 });
    }

    // Pick a problem if not already selected
    let problemId = room.problemId;
    if (!problemId) {
      const problems = await prisma.problem.findMany();
      if (problems.length > 0) {
        problemId = problems[Math.floor(Math.random() * problems.length)].id;
      }
    }

    // Create the battle
    const battle = await prisma.battle.create({
      data: {
        player1Id: room.hostId,
        player2Id: session.user.id,
        problemId: problemId!,
        status: "WAITING",
        timeLimitSec: room.timeLimit,
      },
    });

    // Update room
    await prisma.privateRoom.update({
      where: { id: room.id },
      data: {
        guestId: session.user.id,
        status: "FULL",
        battleId: battle.id,
      },
    });

    return NextResponse.json({
      battleId: battle.id,
      roomCode: room.code,
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
