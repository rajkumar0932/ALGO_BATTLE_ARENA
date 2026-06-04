import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@algobattle/db";
import { MatchmakingLobby } from "@/components/battle/MatchmakingLobby";

export default async function BattlePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, rating: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4">
      <MatchmakingLobby user={user} />
    </div>
  );
}
